import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersModel } from './entities/users.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
  ) {}

  async createUser(nickname: string, email: string, password: string) {
    const user = this.userRepository.create({
      nickname,
      email,
      password,
    })
    const newUser = await this.userRepository.save(user)
    return newUser
  }

  async getAllUsers() {
    return this.userRepository.find()
  }
}
