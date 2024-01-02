import { Column, Entity, OneToMany } from 'typeorm'
import { RolesEnum } from '../const/roles.const'
import { PostsModel } from 'src/posts/entities/posts.entity'
import { BaseModel } from 'src/common/entities/base.entity'
import { IsEmail, IsString, Length } from 'class-validator'

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
  @IsString()
  @Length(1, 20, {
    message: '닉네임은 1~20자 사이로 입력해주세요.',
  })
  nickname: string

  /*** 이메일 특성
   * 1) 유일무이한 값이 될 것
   */
  @Column({
    unique: true,
  })
  @IsString()
  @IsEmail()
  email: string

  @Column()
  @IsString()
  @Length(3, 8)
  password: string

  @Column({
    // role 특성의 타입을 RolesEnum의 모든 값들로 지정
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum

  @OneToMany(() => PostsModel, post => post.author)
  posts: PostsModel[]
}
