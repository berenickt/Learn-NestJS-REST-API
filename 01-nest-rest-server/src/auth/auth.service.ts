import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import { UsersModel } from 'src/users/entities/users.entity'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import { RegisterUserDto } from './dto/register-user.dto'
import { ENV_HASH_ROUNDS_KEY, ENV_JWT_SECRET_KEY } from 'src/common/const/env-keys.const'

/** 만들려는 기능
 * 1) registerWithEmail
 * - email, nickname, password를 입력받고 사용자를 생성한다
 * - 생성이 완료되면, accessToken과 refreshToken을 반환한다
 * 회원가입 후 다시 로그인해주세요 <- 쓸데없는 과정을 방지하기 위해서
 *
 * 2) loginWithEmail
 * - email, password를 입력하면, 사용자 검증을 진행한다.
 * - 검증이 완료되면, accessToken과 refreshToken을 반환한다.
 *
 * 3) loginUser
 * - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
 *
 * 4) signToken
 * - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
 *
 * 5) authenticateWithEmailAndPassword
 * - (2)에서 로그인을 진행할 떄, 필요한 기본적인 검증 진행
 * -- 1. 사용자가 존재하는 확인(email)
 * -- 2. 비밀번호가 맞는지 확인
 * -- 3. 모두 통과되면 사용자 정보 반환
 * -- 4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /*** 토큰을 사용하게 되는 방식
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   *    accessToken과 refreshToken을 발급받는다
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을 보낸다
   *    Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다.
   *    e.g.) {authorization: 'Basic {token}'}
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할 떄는
   *    accessToken을 Header에 추가해서 요청과 함께 보낸다.
   *    e.g.) {authorization: 'Bearer {token}'}
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸
   *    사용자가 누구인지 알 수 있다.
   *    e.g.) 현재 로그인한 사용자가 작성한 포스트만 가져오려면
   *    토큰의 sub 값에 입력돼있는 사용자의 포스트만 따로 필터링할 수 있다.
   *    특정 사용자의 토큰이 없다면, 다른 사용자의 데이터를 접근 못한다.
   * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면, 새로 토큰을 발급받아야 한다.
   *    그렇지 않으면 jwtService.verify()에서 인증이 통과안된다.
   *    그러니 access 토큰을 새로 발급받을 수 있는 /auth/token/access와
   *    refresh 토큰을 새로 발급받을 수 있는 /auth/token/refresh가 필요하다.
   * 6) 토큰이 만료되면, 각각의 토큰을 새로 발급받을 수 있는 엔드포인트에 요청을 해서
   *    새로운 토큰을 발급받고, 새로운 토큰을 사용해서 private route에 접근한다.
   */

  /**** 1) Header로부터 토큰을 받을 떄
   * {authorization: 'Basic {token}'} - 로그인
   * {authorization: 'Bearer {token}'} - 발급받은 토큰을 그대로 넣었을 떄
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ')
    const prefix = isBearer ? 'Bearer' : 'Basic'

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다!')
    }

    const token = splitToken[1]
    return token
  }

  /**** 2) email:password 형태로 바꾸기
   * 1) dafklmlfa:askdmklasmda -> email:password
   * 2) email:password -> [email, password]
   * 3) {email: email, password: password}
   */
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8')
    const split = decoded.split(':')
    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.')
    }
    const email = split[0]
    const password = split[1]
    return {
      email,
      password,
    }
  }

  /**** 3) 토큰 검증
   *
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      })
    } catch (err) {
      throw new UnauthorizedException('토큰이 만료됏거나 잘못된 토큰입니다.')
    }
  }

  // **** 4)
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    })

    /***
     * sub : id
     * email : email
     * type : 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다.')
    }

    return this.signToken({ ...decoded }, isRefreshToken)
  }

  /**** 5) Payload에 들어갈 정보
   * 1) email
   * 2) sub -> 사용자 id
   * 3) type -> 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      expiresIn: isRefreshToken ? 3600 : 300, // 3600초(1시간) 초단위로 설정
    })
  }

  // **** 6) 유저로 로그인
  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    }
  }

  /**** 7)
   * 1. 사용자가 존재하는 확인(email)
   * 2. 비밀번호가 맞는지 확인
   * 3. 모두 통과되면 사용자 정보 반환
   */
  async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.usersService.getUserByEmail(user.email)

    if (!existingUser) throw new UnauthorizedException('존재하지 않는 사용자입니다.')

    /*** 파라미터, campare : 두 비밀번호를 비교해서 boolean값 반환
     * 1) 입력된 비밀번호
     * 2) 기존 해시(hash) -> 사용자 정보에 저장돼있는 hash
     */
    const passOk = bcrypt.compare(user.password, existingUser.password)

    if (!passOk) throw new UnauthorizedException('비밀번호가 틀렸습니다.')

    return existingUser
  }

  // **** 8)
  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user)
    return this.loginUser(existingUser)
  }

  /**** 9) hash 파라미터 (salt값은 자동 생성됨)
   * 1) hash로 만들고 싶은 비밀번호
   * 2) round 돌릴 횟수, 너무 많으면 시간이 기하급수적으로 올라감
   * @see https://www.npmjs.com/package/bcrypt#a-note-on-rounds
   */
  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(
      user.password, //
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
    )
    const newUser = await this.usersService.createUser({
      ...user, //
      password: hash,
    })
    return this.loginUser(newUser)
  }
}
