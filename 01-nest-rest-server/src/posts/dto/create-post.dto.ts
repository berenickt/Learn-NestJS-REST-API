import { IsOptional, IsString } from 'class-validator'

import { PickType } from '@nestjs/mapped-types'
import { PostsModel } from '../entities/posts.entity'

/***
 * Pick, Omit, Partial -> Type을 반환
 * PickType, OmitType, PartialType -> 값을 반환
 */
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsOptional()
  image?: string
}
