import { IsOptional, IsString } from 'class-validator'
import { CreatePostDto } from './create-post.dto'
import { PartialType } from '@nestjs/mapped-types'
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message'

/***
 * Pick, Omit, Partial -> Type을 반환
 * PickType, OmitType, PartialType -> 값을 반환
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  title?: string

  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  content?: string
}
