import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

import { Column, Entity, ManyToOne } from 'typeorm'
import { join } from 'path'
import { BaseModel } from './base.entity'
import { PostsModel } from '../../posts/entity/posts.entity'
import { POST_PUBLIC_IMAGE_PATH } from '../const/path.const'

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number

  /***
   * UserModel -> 사용자 프로필 이미지
   * PostsModel -> 포스트 이미지
   */
  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    // obj는 이미지 모델이 생성됐을 떄의, 현재 객체를 의미
    if (obj.type === ImageModelType.POST_IMAGE) {
      return `/${join(POST_PUBLIC_IMAGE_PATH, value)}`
    } else {
      return value
    }
  })
  path: string

  @ManyToOne(type => PostsModel, post => post.images)
  post?: PostsModel
}
