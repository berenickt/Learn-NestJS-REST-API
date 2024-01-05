import { BadRequestException, Module } from '@nestjs/common'
import * as multer from 'multer'
import { v4 as uuid } from 'uuid'

import e from 'express'
import { CommonService } from './common.service'
import { CommonController } from './common.controller'
import { MulterModule } from '@nestjs/platform-express'
import { TEMP_FOLDER_PATH } from './const/path.const'
import { extname } from 'path'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        // byte 단위로 입력 (10000000byte -> 10MB가 넘는 파일은 에러)
        fieldSize: 10 * 1024 * 1024,
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
        // 파일을 어디에 보낼지 정의
        destination: (req, res, cb) => {
          cb(null, TEMP_FOLDER_PATH)
        },
        filename: (
          req: e.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          callback(null, `${uuid()}${extname(file.originalname)}`)
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
