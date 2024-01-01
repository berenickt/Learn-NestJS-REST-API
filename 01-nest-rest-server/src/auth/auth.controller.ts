import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { MaxLengthPipe, MinLengthPipe } from './pipe/password.pipe'
import { BasicTokenGuard } from './guard/basic-token.guard'
import { RefreshTokenGuard } from './guard/bearer-token.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true)
    const newToken = this.authService.rotateToken(token, false)

    /***
     * {accessToken : {token}}
     */
    return {
      accessToken: newToken,
    }
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true)
    const newToken = this.authService.rotateToken(token, true)

    /***
     * {refreshToken : {token}}
     */
    return {
      refreshToken: newToken,
    }
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string, //
    // @Request() req, // 가드에 생성한 req를 가져와서 쓰기
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, false)
    const credentials = this.authService.decodeBasicToken(token)
    return this.authService.loginWithEmail(credentials)
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string, //
    @Body('email') email: string,
    @Body('password', new MaxLengthPipe(8, '비밀번호'), new MinLengthPipe(3)) password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    })
  }
}
