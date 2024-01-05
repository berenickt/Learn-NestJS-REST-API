import { IsOptional, IsString } from 'class-validator'

import { PickType } from '@nestjs/mapped-types'
import { PostsModel } from '../entities/posts.entity'

/***
 * Pick, Omit, Partial -> Type을 반환
 * PickType, OmitType, PartialType -> 값을 반환
 */
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true, // 리스트 개별 요소마다 string으로 할지
  })
  @IsOptional()
  images: string[]
}
