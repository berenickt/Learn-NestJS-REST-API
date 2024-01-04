import { BadRequestException, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { PostsModel } from './entities/posts.entity'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { CommonModule } from 'src/common/common.module'
import { MulterModule } from '@nestjs/platform-express'
import { extname } from 'path'
import multer from 'multer'
import { POST_IMAGE_PATH } from 'src/common/const/path.const'
import { v4 as uuid } from 'uuid'

@Module({
  imports: [
    /*** 모델에 해당하는 repostory를 주입 ==> forFeature
     * repository : 해당 모델을 다룰 수 있게 해주는 클래스
     */
    TypeOrmModule.forFeature([
      PostsModel, //
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register({
      limits: {
        // byte 단위로 입력 (10000000byte -> 10MB가 넘는 파일은 에러)
        fieldSize: 10000000,
      },
      /*** cb(에러, boolean)
       * 첫번쨰 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
       * 두번쨰 파라미터는 파일을 받을지 말지 boolean을 넣어준다.
       */
      fileFilter: (req, file, cb) => {
        // xxx.jpg -> .jpg같이 확장자만 가져와줌
        const ext = extname(file.originalname)

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다!'), //
            false,
          )
        }
        return cb(null, true)
      },
      storage: multer.diskStorage({
        // 파일을 어디에 보낼지
        destination: function (req, res, cb) {
          cb(null, POST_IMAGE_PATH)
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`)
        },
      }),
    }),
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
