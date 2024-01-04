import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm'
import { PostsModel } from './entities/posts.entity'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { PaginatePostDto } from './dto/paginate-post.dto'
import { HOST, PROTOCOL } from 'src/common/const/env.const'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({ relations: ['author'] })
  }

  /*** 페이지네이션용 테스트 포스트 생성
   *
   */
  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
      })
    }
  }

  /***
   * 1) 오름차순으로 정렬하는 pagination만 구현한다
   */
  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto, //
      this.postsRepository,
      {},
      'posts',
    )
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto)
    // } else {
    //   return this.cursorPaginatePosts(dto)
    // }
  }

  /*** 페이지 기반 페이지네이션
   * data: Data[],
   * total: number
   */
  async pagePaginatePosts(dto: PaginatePostDto) {
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * dto.page,
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    })

    return {
      data: posts,
      total: count,
    }
  }

  /*** 커서 기반 페이지네이션
   *
   */
  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {}

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than)
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than)
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    })

    /****
     * 해당되는 포스트가 0개 이상이면, 마지막 포스트를 가져오고
     * 아니면 null을 반환한다.
     */
    const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`)

    /**** dto의 키값들을 루핑하면서
     * 키값에 해당되는 벨류가 존재하면, parame에 그대로 붙여넣는다.
     * 단, where__id__more_than 값만  lastItem의 마지막 값으로 넣어준다.
     */
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
            nextUrl.searchParams.append(key, dto[key])
          }
        }
      }
      let key = null
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than'
      } else {
        key = 'where__id__less_than'
      }
      nextUrl.searchParams.append(key, lastItem.id.toString())
    }

    /*** Response
     * data : Data[],
     * cursor : {
     *  after: 마지막 Data의 ID
     * }
     * count: 응답한 데이터의 개수
     * next: 다음 요청을 할 떄 사용할 URL
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    }
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      // PostsModel의 id가 입력받은 id와 같은지 필터링
      where: {
        id,
      },
      relations: ['author'],
    })
    if (!post) {
      throw new NotFoundException()
    }
    return post
  }

  /**
   * 1) create : 저장할 객체를 생성
   * 2) save   : 객체를 저장 (create 메서드에서 생성한 객체로)
   */
  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    })
    const newPost = await this.postsRepository.save(post)
    return newPost
  }

  /** save의 2가지 기능
   * 1) 만약에 데이터가 존재하지 않는다면(id 기준) 새로 생성한다.
   * 2) 만약에 데이터가 존재한다면(같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
   */
  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    })

    if (!post) throw new NotFoundException()
    if (title) post.title = title
    if (content) post.content = content

    const newPost = await this.postsRepository.save(post)
    return newPost
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    })

    if (!post) throw new NotFoundException()

    await this.postsRepository.delete(postId)

    return postId
  }
}
