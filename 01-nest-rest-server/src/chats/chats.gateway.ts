import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-exception.filter'
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer-token.guard'
import { UsersModel } from 'src/users/entities/users.entity'

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
  ) {}

  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    console.log(`On connect called : ${socket.id}`)
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
  @UseGuards(SocketBearerTokenGuard)
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
  @UseGuards(SocketBearerTokenGuard)
  async enterChat(@MessageBody() data: EnterChatDto, @ConnectedSocket() socket: Socket) {
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
  @UseGuards(SocketBearerTokenGuard)
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
