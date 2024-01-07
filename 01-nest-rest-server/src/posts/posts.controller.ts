import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard'
import { User } from 'src/users/decorator/user.decorator'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { PaginatePostDto } from './dto/paginate-post.dto'
import { UsersModel } from 'src/users/entities/users.entity'
import { ImageModelType } from 'src/common/entities/image.entity'
import { DataSource, QueryRunner as QR } from 'typeorm'
import { PostsImagesService } from './image/images.service'
import { LogInterceptor } from 'src/common/interceptor/log.interceptor'
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor'
import { QueryRunner } from 'src/common/decorator/query-runner.decorator'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
    private readonly dataSource: DataSource,
  ) {}

  /*** 1) GET /posts
   * 모든 post를 다 가져온다
   */
  @Get()
  @UseInterceptors(LogInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query)
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
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number, //
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
    // 기본값을 true로 설정하는 파이프
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    const post = await this.postsService.createPost(userId, body, qr)

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      )
    }
    return this.postsService.getPostById(post.id, qr)
  }

  /*** 4) POST /posts/random
   * 무작위 포스트를 생성한다.
   */
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id)
    return true
  }

  /*** 5) PATCH /posts/:id
   * id에 해당하는 post를 부분 변경한다
   */
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number, //
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body)
  }

  /*** 6) DELETE /posts/:id
   * id에 해당하는 post를 삭제한다
   */
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id)
  }
}
