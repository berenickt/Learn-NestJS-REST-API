import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CreateChatDto } from './dto/create-chat.dto'
import { ChatsService } from './chats.service'

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatsService) {}

  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    console.log(`On connect called : ${socket.id}`)
  }

  @SubscribeMessage('create_chat')
  async createChat(@MessageBody() data: CreateChatDto) {
    const chat = await this.chatService.createChat(data)
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    @MessageBody() data: number[], //
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data) {
      socket.join(chatId.toString())
    }
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
