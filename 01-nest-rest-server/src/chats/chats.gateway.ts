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

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    console.log(`On connect called : ${socket.id}`)
  }

  @SubscribeMessage('create_chat')
  async createChat(@MessageBody() data: CreateChatDto) {
    const chat = await this.chatsService.createChat(data)
  }

  @SubscribeMessage('enter_chat')
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
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket, //
  ) {
    // **** socket은 현재 연결된 socket을 의미 (나를 제외하고 다른사람들한테만 보내기)
    socket
      .to(message.chatId.toString()) //
      .emit('receive_message', message.message)

    // **** 서버 전체 사용자에게만 메시지 보내기
    // this.server
    //   .in(message.chatId.toString()) //
    //   .emit('receive_message', message.message)
  }
}
