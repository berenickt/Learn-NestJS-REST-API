import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`)
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

  // socket.on('send_message', (message)=>{ console.log(message)})
  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: { message: string; chatId: number }) {
    // 방에 들어간 사용자에게만 메시지 보내기
    this.server
      .in(message.chatId.toString()) //
      .emit('receive_message', message.message)
  }
}
