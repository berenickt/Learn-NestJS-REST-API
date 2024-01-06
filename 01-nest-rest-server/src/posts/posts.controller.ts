import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard'
import { User } from 'src/users/decorator/user.decorator'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { PaginatePostDto } from './dto/paginate-post.dto'
import { UsersModel } from 'src/users/entities/users.entity'
import { ImageModelType } from 'src/common/entities/image.entity'
import { DataSource } from 'typeorm'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
  ) {}

  /*** 1) GET /posts
   * 모든 post를 다 가져온다
   */
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query)
  }

  /*** POST /posts/random
   *
   */
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id)
    return true
  }

  /*** 2) GET /posts/:id
   * id에 해당하는 post를 가져온다
   * e.g. 11이라는 ID를 갖고있는 Post 하나를 가져온다.
   */
  // @Param('id') 뜻 : 가져오는 파라미터의 이름은 id이다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id)
  }

  /*** 3) POST /posts
   * post를 생성한다
   *
   * A Model, B Model
   * Post API -> A모델을 저장하고, B모델을 저장한다.
   * await repository.save(a)
   * await repository.save(b)
   *
   * 만약에 a를 저장하다가 실패하면 b를 저장하면 안될 경우
   * 이 경우를 막기 위해 등장한 것이 Transaction
   * all or nothing
   *
   * Transaction
   * start -> 시작
   * commit -> 저장
   * rollback -> 원상복구
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
    // 기본값을 true로 설정하는 파이프
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    // (1) 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너(qr)를 생성한다.
    const qr = this.dataSource.createQueryRunner()

    // (2) 쿼리 러너에 연결한다.
    await qr.connect()
    /*** 쿼리 러너에서 트랜잭션을 시작한다.
     * 이 시점부터 같은 쿼리 러너를 사용하면
     * 트랜잭션 안에서 데이터베이스 액션을 실행한다.
     */
    await qr.startTransaction()

    // 로직실행
    try {
      const post = await this.postsService.createPost(userId, body)
      for (let i = 0; i < body.images.length; i++) {
        await this.postsService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        })
      }
      await qr.commitTransaction()
      await qr.release()
      return this.postsService.getPostById(post.id)
    } catch (e) {
      // 어떤 에러든 에러가 던져지면, 트랜잭션을 종료하고 원래 상태로 되돌린다.
      await qr.rollbackTransaction()
      await qr.release()
    }
  }

  /*** 4) PATCH /posts/:id
   * id에 해당하는 post를 부분 변경한다
   */
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number, //
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body)
  }

  /*** 5) DELETE /posts/:id
   * id에 해당하는 post를 삭제한다
   */
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id)
  }
}
