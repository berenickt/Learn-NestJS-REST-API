import { IsOptional, IsString } from 'class-validator'
import { CreatePostDto } from './create-post.dto'
import { PartialType } from '@nestjs/mapped-types'

/***
 * Pick, Omit, Partial -> Type을 반환
 * PickType, OmitType, PartialType -> 값을 반환
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  content?: string
}
