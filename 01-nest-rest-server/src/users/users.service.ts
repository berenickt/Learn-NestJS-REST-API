import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersModel } from './entity/users.entity'
import { QueryRunner, Repository, Tree } from 'typeorm'
import { UserFollowersModel } from './entity/user-followers.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr //
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository
  }

  getUserFollowRepository(qr?: QueryRunner) {
    return qr //
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository
  }

  /**** 1) 회원가입
   * - nickname 중복이 없는지 확인
   * - exist() : 만약 조건에 해당되는 값이 있으면 true 반환
   */
  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    const nicknameExists = await this.usersRepository.exist({
      where: { nickname: user.nickname },
    })
    if (nicknameExists) throw new BadRequestException('이미 존재하는 nickname입니다.')

    const emailExists = await this.usersRepository.exist({
      where: { nickname: user.email },
    })
    if (emailExists) throw new BadRequestException('이미 가입한 이메일입니다.')

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    })
    const newUser = await this.usersRepository.save(userObject)
    return newUser
  }

  // **** 2) 모든 사용자 가져오기
  async getAllUsers() {
    return this.usersRepository.find()
  }

  // **** 3) 이메일별 사용자 가져오기
  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    })
  }

  // **** 4) 팔로우 요청
  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr)

    await userFollowersRepository.save({
      follower: { id: followerId },
      followee: { id: followeeId },
    })

    return true
  }

  // **** 5) 팔로워들 조회
  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const where = {
      followee: { id: userId },
    }

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true
    }

    const result = await this.userFollowersRepository.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    })

    return result.map(el => ({
      id: el.follower.id,
      nickname: el.follower.nickname,
      email: el.follower.email,
      isConfirmed: el.isConfirmed,
    }))
  }

  // **** 팔로우 요청 승인
  async confirmFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr)

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: { id: followerId },
        followee: { id: followeeId },
      },
      relations: {
        follower: true,
        followee: true,
      },
    })

    if (!existing) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다!')
    }

    await userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    })

    return true
  }

  // **** 팔로우 요청 삭제
  async deleteFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr)

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    })

    return true
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr)

    await userRepository.increment(
      { id: userId }, //
      'followerCount',
      1,
    )
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr)

    await userRepository.decrement(
      { id: userId }, //
      'followerCount',
      1,
    )
  }
}
