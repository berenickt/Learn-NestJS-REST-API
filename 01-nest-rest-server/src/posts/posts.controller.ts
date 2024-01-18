import {
  Body,
  Controller,
  Delete,
  Get,
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
import { UsersModel } from 'src/users/entity/users.entity'
import { ImageModelType } from 'src/common/entity/image.entity'
import { DataSource, QueryRunner as QR } from 'typeorm'
import { PostsImagesService } from './image/images.service'
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor'
import { QueryRunner } from 'src/common/decorator/query-runner.decorator'
import { Roles } from 'src/users/decorator/roles.decorator'
import { RolesEnum } from 'src/users/const/roles.const'
import { IsPublic } from 'src/common/decorator/is-public.decorator'
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
    private readonly dataSource: DataSource,
  ) {}

  // **** (1) GET /posts : 모든 post 조회
  @Get()
  @IsPublic()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query)
  }

  // **** 2) GET /posts/:id : id에 해당하는 post 조회
  // @Param('id') 뜻 : 가져오는 파라미터의 이름은 id이다
  @Get(':id')
  @IsPublic()
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

  // (4) POST /posts/random : 무작위 포스트를 생성
  @Post('random')
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id)
    return true
  }

  // **** (5) PATCH /posts/:id : id에 해당하는 post를 부분 변경
  @Patch(':postId')
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(
    @Param('postId', ParseIntPipe) id: number, //
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body)
  }

  // **** (6) DELETE /posts/:id : id에 해당하는 post를 삭제
  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id)
  }

  // RBAC (Role Based Access Control)
}
