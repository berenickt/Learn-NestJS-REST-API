import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const status = exception.getStatus()

    /**** Filter 전역 설정
     * 로그 파일을 생성하거나,
     * 에러 모니터링 시스템에 API 요청하기 기능을 만들고
     * global하게 쓸 수도 있음(main.ts)
     */

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    })
  }
}
