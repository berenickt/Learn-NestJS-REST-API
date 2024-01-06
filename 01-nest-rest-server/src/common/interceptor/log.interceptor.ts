import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map, tap } from 'rxjs'

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    /**
     * 요청이 들어올때 REQ 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날때 (응답이 나갈때) 다시 타임스탬프를 찍는다.
     * [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
     */
    const now = new Date()

    const req = context.switchToHttp().getRequest()

    /***
     * /posts
     * /common/image
     */
    const path = req.originalUrl

    // [REQ] {요청 path} {요청 시간}
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`)

    /***
     * return next.handle()을 실행하는 순간
     * 라우트의 로직이 전부 실행되고 응답이 반환된다.
     * observable로
     */
    // pipe() 안에 RxJS에서 제공해주는 함수들을 무한하게 넣을 수 있음
    return next.handle().pipe(
      /*** tap()과 map()
       * tap() : 모니터링해주는 함수
       * map() : 변형해주는 함수
       */
      tap(
        // [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
        observable =>
          console.log(
            `[RES] ${path} ${new Date().toLocaleString('kr')} ${
              new Date().getMilliseconds() - now.getMilliseconds()
            }ms`,
          ),
      ),
      // **** map과 tap 연습
      // map(observable => {
      //   return {
      //     message: '응답이 변경됐습니다.',
      //     response: observable,
      //   }
      // }),
      // tap(observable => console.log(observable)),
    )
  }
}
