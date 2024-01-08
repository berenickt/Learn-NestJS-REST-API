import { Entity, ManyToMany } from 'typeorm'
import { UsersModel } from '../../users/entities/users.entity'
import { BaseModel } from 'src/common/entities/base.entity'

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, user => user.chats)
  users: UsersModel[]
}
