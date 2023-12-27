import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModel } from './entity/user.entity'
import { StudentModel, TeacherModel } from './entity/person.entity'
import { AirplaneModel, BookModel, CarModel, ComputerModel, SingleBaseModel } from './entity/inheritance.entity'
import { ProfileModel } from './entity/profile.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, ProfileModel]),
    TypeOrmModule.forRoot({
      // 데이터베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5808,
      username: 'postgres',
      password: 'postgres',
      database: 'typeormstudy',
      // entities폴더에 작성한 Model 가져오기
      entities: [
        UserModel,
        StudentModel, //
        TeacherModel,
        BookModel,
        CarModel,
        SingleBaseModel,
        ComputerModel,
        AirplaneModel,
        ProfileModel,
      ],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
