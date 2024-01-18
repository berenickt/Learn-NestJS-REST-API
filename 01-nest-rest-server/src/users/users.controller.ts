import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from './decorator/roles.decorator'
import { RolesEnum } from './const/roles.const'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*** ClassSerializerInterceptor 뜻
   * Serialization(직렬화)
   * - 현재 시스템에서 사용되는 (NestJS) 데이터 구조를 다른 시스템에서도 사용할 수 있는 포맷으로 변환
   * - class의 object에서 JSON 포맷으로 변환
   *
   * Deserialization(역직렬화) : 직렬화의 반대
   */
  @Get()
  @Roles(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers()
  }

  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string, //
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return this.usersService.createUser({ nickname, email, password })
  // }
}
