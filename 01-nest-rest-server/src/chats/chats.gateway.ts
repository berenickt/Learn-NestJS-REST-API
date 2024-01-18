import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CreateChatDto } from './dto/create-chat.dto'
import { ChatsService } from './chats.service'
import { EnterChatDto } from './dto/enter-chat.dto'
import { CreateMessagesDto } from './messages/dto/create-messages.dto'
import { ChatsMessagesService } from './messages/messages.service'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-exception.filter'
import { UsersModel } from 'src/users/entity/users.entity'
import { AuthService } from 'src/auth/auth.service'
import { UsersService } from 'src/users/users.service'

// ws://localhost:3000/chats
@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server

  // Gateway가 시작됐을 때, 특정 함수를 실행하거나 로직을 실행하고 싶을 떄 사용
  afterInit(server: Server): any {
    console.log(`After gateway init...`)
  }

  // Gateway의 연결이 끊어졌을 때, 특정 함수를 실행하거나 로직을 실행하고 싶을 떄 사용
  handleDisconnect(socket: Socket): any {
    console.log(`On disconnect called... ${socket.id}`)
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`On connect called... ${socket.id}`)
    const rawToken = socket.handshake.headers['authorization']
    if (!rawToken) socket.disconnect()

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true)
      const payload = this.authService.verifyToken(token)
      socket.user = await this.usersService.getUserByEmail(payload.email)

      return true
    } catch (e) {
      socket.disconnect()
    }
  }

  @SubscribeMessage('create_chat')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        // 임의로 변환을 허가
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  async createChat(
    @MessageBody() data: CreateChatDto, //
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data)
  }

  @SubscribeMessage('enter_chat')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  async enterChat(
    @MessageBody() data: EnterChatDto, //
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId)

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        })
      }
    }

    socket.join(data.chatIds.map(x => x.toString()))
  }

  @SubscribeMessage('send_message')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto, //
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId)

    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 채팅방입니다! ::: ChatID: ${dto.chatId}`,
      })
    }

    const message = await this.messageService.createMessage(dto, socket.user.id)
    socket.to(message.chat.id.toString()).emit('receive_message', message.message)
  }
}
