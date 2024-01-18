import { Entity, ManyToMany, OneToMany } from 'typeorm'
import { UsersModel } from '../../users/entity/users.entity'
import { BaseModel } from 'src/common/entity/base.entity'
import { MessagesModel } from '../messages/entitiy/messages.entity'

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, user => user.chats)
  users: UsersModel[]

  @OneToMany(() => MessagesModel, message => message.chat)
  messages: MessagesModel[]
}
