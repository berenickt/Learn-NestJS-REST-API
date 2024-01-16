import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { BaseWsExceptionFilter } from '@nestjs/websockets'

// 모든 HTTP Exception을 잡기
@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient()
    socket.emit('exception', {
      status: 'Exception',
      message: exception.getResponse(), // 응답에서 받는 값을 받을 수 있음
    })
  }
}
