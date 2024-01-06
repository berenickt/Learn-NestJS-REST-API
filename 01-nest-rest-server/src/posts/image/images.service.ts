import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryRunner, Repository } from 'typeorm'
import { basename, join } from 'path'

import { promises } from 'fs'
import { CreatePostImageDto } from './dto/create-image.dto'
import { ImageModel } from 'src/common/entities/image.entity'
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const'

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel) //
      : this.imageRepository
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = qr.manager.getRepository<ImageModel>(ImageModel)

    // dto의 이미지 이름을 기반으로 파일 경로를 생성한다
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path)

    try {
      /*** promises의 fs 모듈을 import
       * 파일이 존재하는지 확인
       * 만약에 존재하지 않는다면 에러를 던짐
       */
      await promises.access(tempFilePath)
    } catch (e) {
      throw new BadRequestException('존재하지 않는 임시 파일입니다!')
    }

    /*** 파일의 이름만 가져오기
     * /USers/aaa/bbb/ccc/asdf.jpg -> asdf.jpg
     */
    const fileName = basename(tempFilePath)

    /*** 새로 이동할 포스트 폴더의 경로 + 이미지의 이름
     * {프로젝트경로}/public/posts/asdf.jpg
     */
    const publicFilePath = join(POST_IMAGE_PATH, fileName)

    // save
    const result = await repository.save({
      ...dto,
    })

    // 파일 옮기기
    await promises.rename(tempFilePath, publicFilePath)

    return result
  }
}
