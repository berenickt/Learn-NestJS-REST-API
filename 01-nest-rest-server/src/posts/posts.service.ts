import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PostsModel } from './entities/posts.entity'
import { CreatePostDto } from './dto/create-post.dto'

export interface PostModel {
  id: number
  author: string
  title: string
  content: string
  likeCount: number
  commentCount: number
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({ relations: ['author'] })
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
  async updatePost(postId: number, title: string, content: string) {
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
