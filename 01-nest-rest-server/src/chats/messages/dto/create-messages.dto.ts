import { PickType } from '@nestjs/mapped-types'
import { IsNumber } from 'class-validator'
import { MessagesModel } from '../entitiy/messages.entity'

export class CreateMessagesDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number
}
