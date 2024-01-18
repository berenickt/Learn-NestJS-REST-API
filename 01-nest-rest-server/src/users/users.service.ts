import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersModel } from './entity/users.entity'
import { Repository, Tree } from 'typeorm'
import { UserFollowersModel } from './entity/user-followers.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  /**** 1) 회원가입
   * - nickname 중복이 없는지 확인
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

  // **** 2) 모든 사용자 가져오기
  async getAllUsers() {
    return this.userRepository.find()
  }

  // **** 3) 이메일별 사용자 가져오기
  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    })
  }

  // **** 4) 팔로우 요청
  async followUser(followerId: number, followeeId: number) {
    return await this.userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    })
  }

  // **** 5) 팔로워들 조회
  async getFollowers(userId: number): Promise<UsersModel[]> {
    const result = await this.userFollowersRepository.find({
      where: {
        followee: {
          id: userId,
        },
      },
      relations: {
        follower: true,
      },
    })

    return result.map(userFollow => userFollow.follower)
  }
}
