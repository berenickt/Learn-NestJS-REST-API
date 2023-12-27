import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { PostModel } from './post.entity'

@Entity()
export class TagModel {
  @PrimaryGeneratedColumn()
  id: number

  // M:M 연결이기 때문에 둘 다 복수로 선언
  @ManyToMany(() => PostModel, post => post.tags)
  posts: PostModel[]

  @Column()
  name: string
}
