import { IsEmail, IsString, Length } from 'class-validator'
import { Exclude } from 'class-transformer'

import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { RolesEnum } from '../const/roles.const'
import { PostsModel } from 'src/posts/entities/posts.entity'
import { BaseModel } from 'src/common/entities/base.entity'
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message'
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message'
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message'
import { ChatsModel } from 'src/chats/entity/chats.entity'

@Entity()
export class UsersModel extends BaseModel {
  /*** 닉네임 특성
   * 1) 길이가 20을 넘지 않을 것
   * 2) 유일무이한 값이 될 것
   */
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string

  /*** 이메일 특성
   * 1) 유일무이한 값이 될 것
   */
  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /*** 📌 toClassOnly와 toPlainOnly
   * Request
   * frontend -> backend
   * plain object (JSON) -> class instance (dto)
   *
   * Response
   * backend -> frontend
   * class instance (dto) -> plain obejct (JSON)
   *
   * toClassOnly -> class Instance 변환될 떄만 (요청일 떄)
   * toPlainOnly -> plain object로 변환될 떄만 (응답일 때)
   * 응답이 나갈 떄만 password를 제외시키고 싶을 떄
   */
  @Exclude({ toPlainOnly: true })
  password: string

  @Column({
    // role 특성의 타입을 RolesEnum의 모든 값들로 지정
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum

  @OneToMany(() => PostsModel, post => post.author)
  posts: PostsModel[]

  @ManyToMany(() => ChatsModel, chat => chat.users)
  @JoinTable()
  chats: ChatsModel[]
}
