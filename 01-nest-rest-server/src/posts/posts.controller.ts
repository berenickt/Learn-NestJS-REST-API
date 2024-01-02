import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /*** 1) GET /posts
   * 모든 post를 다 가져온다
   */
  @Get()
  getPosts() {
    return this.postsService.getAllPosts()
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
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
    @Request() req: any,
    @Body('title') title: string, //
    @Body('content') content: string,
    // 기본값을 true로 설정하는 파이프
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    const authorId = req.user.id
    return this.postsService.createPost(authorId, title, content)
  }

  /*** 4) PATCH /posts/:id
   * id에 해당하는 post를 부분 변경한다
   */
  @Patch(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number, //
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content)
  }

  /*** 5) DELETE /posts/:id
   * id에 해당하는 post를 삭제한다
   */
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id)
  }
}
