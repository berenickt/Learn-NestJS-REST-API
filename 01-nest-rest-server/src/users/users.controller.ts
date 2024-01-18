import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from './decorator/roles.decorator'
import { RolesEnum } from './const/roles.const'
import { User } from './decorator/user.decorator'
import { UsersModel } from './entity/users.entity'

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

  // **** 내 팔로워들 조회
  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel, //
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed)
  }

  // **** 팔로우 요청
  @Post('follow/:id')
  async postFollow(
    @User() user: UsersModel, //
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.followUser(user.id, followeeId)
    return true
  }

  // **** 팔로우 요청 승인
  @Patch('follow/:id/confirm')
  async patchFollowConfirm(
    @User('id') followeeId: number, //
    @Param('id', ParseIntPipe) followerId: number,
  ) {
    await this.usersService.confirmFollow(followerId, followeeId)
    return true
  }

  // **** 팔로우 요청 삭제
  @Delete('follow/:id')
  async deleteFollow(
    @User() user: UsersModel, //
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.deleteFollow(user.id, followeeId)
    return true
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
