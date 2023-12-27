import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserModel } from './user.entity'
import { TagModel } from './tag.entity'

@Entity()
export class PostModel {
  @PrimaryGeneratedColumn()
  id: number

  // 1:M 관계이니 posts로 복수형으로 선언
  @ManyToOne(() => UserModel, user => user.posts)
  author: UserModel

  // M:M 연결이기 때문에 둘 다 복수로 선언
  @ManyToMany(() => TagModel, tag => tag.posts)
  // M:M 연결에서 JoinTable은 둘 중 하나 아무군데 선언해주면 된다
  @JoinTable()
  tags: TagModel[]

  @Column()
  title: string
}
