import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserModel } from './entity/user.entity'
import { ILike, IsNull, LessThan, Repository } from 'typeorm'
import { ProfileModel } from './entity/profile.entity'
import { PostModel } from './entity/post.entity'
import { TagModel } from './entity/tag.entity'

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Post('sample')
  async sample() {
    // 📌 (1) 모델에 해당되는 객체 생성 - 저장은 안함
    // const user1 = await this.userRepository.create({
    //   email: 'test@gmail.ai',
    // })

    // 📌 (2) 모델에 해당되는 객체 생성 - DB에 저장함
    // const user2 = await this.userRepository.save({
    //   email: 'test@gmail.ai',
    // })

    /*** 📌 (3) preload
     * 입력된 값을 기반으로 DB에 데이터를 불러오고,
     * 추가입력된 값으로 DB에 가져온 값들을 대체함
     * 저장하지는 않음
     */
    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'test변경-저장x@gmail.ai',
    // })

    // 📌 (4) 삭제하기
    // await this.userRepository.delete(101)

    // 📌 (5) 숫자형 컬럼 증가 (id가 1인 count 컬럼을 2만큼 증가)
    // await this.userRepository.increment(
    //   { id: 1 }, //
    //   'count',
    //   2,
    // )

    // 📌 (6) 숫자형 컬럼 감소 (id가 1인 count 컬럼을 1만큼 감소)
    // await this.userRepository.decrement(
    //   { id: 1 }, //
    //   'count',
    //   1,
    // )

    // 📌 (7) 개수 카운팅하기
    // const count = await this.userRepository.count({
    //   where: {
    //     email: ILike('%0%'),
    //   },
    // })

    // 📌 (8) sum : 속성들의 값 전부 합치기
    // const sum = await this.userRepository.sum('count', {
    //   email: ILike('%0%'),
    // })

    // 📌 (9) average : 속성의 평균값 구하기
    // const average = await this.userRepository.average('count', {
    //   id: LessThan(4),
    // })

    // 📌 (10) min : 속성의 최소값 구하기
    // const min = await this.userRepository.minimum('count', {
    //   id: LessThan(4),
    // })

    // 📌 (10) max : 속성의 최대값 구하기
    // const max = await this.userRepository.maximum('count', {
    //   id: LessThan(4),
    // })

    // 📌 (11) find와 findOne도 있음(많이 다뤘으니 생략)
    // const userOne = await this.userRepository.findOne({
    //   where: { id: 3 },
    // })

    // 📌 (12) 3개의 값을 가져오는데, 전체 행 개수도 반환해줌
    const usersAndCount = await this.userRepository.findAndCount({
      take: 3,
    })

    return usersAndCount
  }

  @Post('users')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({
        email: `user-${i}@google.com`,
      })
    }
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      order: { id: 'ASC' },
      where: {
        // 📌 (1) 1이 아닌 경우 가져오기
        // id: Not(1),
        // 📌 (2) 30 미만의 적은 경우 가져오기
        // id: LessThan(30),
        // 📌 (3) 30 이하의 적은 경우 가져오기
        // id: LessThanOrEqual(30),
        // 📌 (4) 30 초과의 많은 경우 가져오기
        // id: MoreThan(30)
        // 📌 (5) 30 이상의 많은 경우 가져오기
        // id: MoreThanOrEqual(30)
        // 📌 (6) 같은 경우
        // id : Equal(30)
        // 📌 (7) 유사값, %로 유사한 문자 찾기 (대소문자 구분함)
        // email: Like('%0@google%'),
        // 📌 (8) 유사값, %로 유사한 문자 찾기 (대소문자 구분안함)
        // email: ILike('%GOOGLE%'),
        // 📌 (9) 사이값, 10~15번 사이까지의 값
        // id: Between(10, 15),
        // 📌 (10) 해당되는 여러 개의 값, 1, 3, 5, 7, 99의 id 찾기
        // id: In([1, 3, 5, 7, 99]),
        // 📌 (11) ID가 null인 경우 찾기
        // id: IsNull(),
      },
      // 어떤 속성을 선택할지 (기본은 모든 속성을 가져옴)
      // select를 정의하면, 정의한 속성만 가져온다
      // select: {
      //   id: true,
      //   email: true,
      //   version: true,
      //   profile: {
      //     id: true,
      //   },
      // },
      // // 필터링할 조건을 입력한다 ({}안에서는 전부 and 조건으로 필터링)
      // where: [
      //   // id가 3이거나 or version이 1
      //   {
      //     id: 3,
      //   },
      //   {
      //     version: 1,
      //   },
      // ],
      // // ------ 다른 관계를 필터링하는 법
      // // where: {
      // //   profile: {
      // //     id: 3,
      // //   },
      // // },
      // // 관계를 가져오는 법
      // relations: {
      //   profile: true,
      // },
      // // 오름차(ASC)-기본, 내림차(DESC)
      // order: {
      //   id: 'DESC',
      // },
      // // 처음 몇 개를 제외할 지 (기본은 0) 1이면 1개 스킵
      // skip: 0,
      // // 몇 개를 가져올지 (기본값은 0, 전체) 1이면 1개만 가져옴
      // take: 0,
    })
  }

  @Patch('users/:id')
  async patchUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: { id: parseInt(id) },
    })

    return this.userRepository.save({
      ...user,
      email: user.email + '0',
    })
  }

  @Delete('user/profile/:id')
  async deleteProfile(@Param('id') id: string) {
    await this.profileRepository.delete(+id)
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'asd@gmail.ai',
    })
    const profile = await this.profileRepository.save({
      profileImg: 'asdf.png',
      user,
    })
    return user
  }

  @Post('user/post')
  async createUserAndPost() {
    const user = await this.userRepository.save({
      email: 'postuser@gmail.ai',
    })
    await this.postRepository.save({
      author: user,
      title: 'post 1',
    })
    await this.postRepository.save({
      author: user,
      title: 'post 2',
    })

    return user
  }

  @Post('posts/tags')
  async createPostsTags() {
    const post1 = await this.postRepository.save({
      title: 'NestJS 수업',
    })

    const post2 = await this.postRepository.save({
      title: '프로그래밍 수업',
    })

    const tag1 = await this.tagRepository.save({
      name: 'Javascript',
      posts: [post1, post2],
    })

    const tag2 = await this.tagRepository.save({
      name: 'Typescript',
      posts: [post1],
    })

    const post3 = await this.postRepository.save({
      title: 'NextJS 수업',
      tags: [tag1, tag2],
    })

    return true
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({
      relations: {
        tags: true,
      },
    })
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      },
    })
  }
}
