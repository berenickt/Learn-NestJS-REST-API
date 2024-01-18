import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UsersModel } from './entity/users.entity'
import { UserFollowersModel } from './entity/user-followers.entity'

@Module({
  // 이 모듈 안에서 UsersModel을 어디서든 사용 가능
  imports: [
    TypeOrmModule.forFeature([
      UsersModel, //
      UserFollowersModel,
    ]),
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
