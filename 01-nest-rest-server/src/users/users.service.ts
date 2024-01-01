import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersModel } from './entities/users.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
  ) {}

  /***
   * 1) nickname 중복이 없는지 확인
   * - exist() : 만약 조건에 해당되는 값이 있으면 true 반환
   */
  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    const nicknameExists = await this.userRepository.exist({
      where: { nickname: user.nickname },
    })
    if (nicknameExists) throw new BadRequestException('이미 존재하는 nickname입니다.')

    const emailExists = await this.userRepository.exist({
      where: { nickname: user.email },
    })
    if (emailExists) throw new BadRequestException('이미 가입한 이메일입니다.')

    const userObject = this.userRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    })
    const newUser = await this.userRepository.save(userObject)
    return newUser
  }

  async getAllUsers() {
    return this.userRepository.find()
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    })
  }
}
