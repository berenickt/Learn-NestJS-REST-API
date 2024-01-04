import { IsString } from 'class-validator'
import { BaseModel } from 'src/common/entities/base.entity'
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message'
import { UsersModel } from 'src/users/entities/users.entity'
import { Column, Entity, ManyToOne } from 'typeorm'

@Entity()
export class PostsModel extends BaseModel {
  /*** 작성자 1명이 여러 개의 포스트를 작성
   * 1) UserModel과 연동한다 (Foreign Key를 사용해서)
   * 2) null이 될 수 없다
   */
  // one에 해당하는 클래스 타입을 넣어주면 된다
  // 이 클래스 타입을 두 번쨰 함수의 파라미터로 받을 수 있다.
  // 어떤 파라미터와 연동시킬지 선택
  @ManyToOne(() => UsersModel, user => user.posts, {
    nullable: false,
  })
  author: UsersModel

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string

  @Column({
    nullable: true,
  })
  image?: string

  @Column()
  likeCount: number

  @Column()
  commentCount: number
}
