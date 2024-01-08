import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatsModel } from './entity/chats.entity'
import { Repository } from 'typeorm'
import { CreateChatDto } from './dto/create-chat.dto'

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
  ) {}

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      users: dto.userIds.map(id => ({ id })),
    })

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    })
  }
}
