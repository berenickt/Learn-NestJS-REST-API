import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RolesEnum } from '../const/roles.const'
import { PostsModel } from 'src/posts/entities/posts.entity'

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number

  /*** 닉네임 특성
   * 1) 길이가 20을 넘지 않을 것
   * 2) 유일무이한 값이 될 것
   */
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string

  /*** 이메일 특성
   * 1) 유일무이한 값이 될 것
   */
  @Column({
    unique: true,
  })
  email: string

  @Column()
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
