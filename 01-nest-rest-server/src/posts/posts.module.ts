import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { PostsModel } from './entities/posts.entity'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { CommonModule } from 'src/common/common.module'
import { ImageModel } from 'src/common/entities/image.entity'

@Module({
  imports: [
    /*** 모델에 해당하는 repostory를 주입 ==> forFeature
     * repository : 해당 모델을 다룰 수 있게 해주는 클래스
     */
    TypeOrmModule.forFeature([
      PostsModel, //
      ImageModel,
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  /** 컨트롤러로 사용할 파일을 정의
   * 컨트롤러로 사용할 파일을 정의,
   * 특정 path로 요청이 오면 라우팅해주는 역할
   *
   * PostsController() ===> 인스턴스화
   * PostsController ===> 클래스 그 자체
   * 잘 보면, 인스턴스가 아닌 클래스 그 자체를 넣었다
   * 왜냐하면 IoC 컨테이너가 인스턴스를 생성, 수정, 삭제하길 바라니까
   */
  controllers: [PostsController],
  /** 컨트롤러에서 주입할 값들을 providers 안에 정의
   * PostsService는 어떤 역할을 하는지에 대한 정의다.
   * 데이터를 다루는 로직을 작성하는 클래스 === Service
   *
   * 서비스가 아니더라도 주입해야할 클래스들은
   * 전부 providers 안에 넣어주면 된다.
   *
   * porviders 안에 등록된 모든 클래스들은 인스턴스화 없이
   * IoC 컨테이너가 의존하면서 사용할 수 있게 된다.
   */
  providers: [PostsService],
})
export class PostsModule {}
