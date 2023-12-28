import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { PostsService } from './posts.service'

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
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id)
  }

  /*** 3) POST /posts
   * post를 생성한다
   */
  @Post()
  postPosts(
    @Body('author') author: string, //
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(author, title, content)
  }

  /*** 4) PATCH /posts/:id
   * id에 해당하는 post를 부분 변경한다
   */
  @Patch(':id')
  putPost(
    @Param('id') id: string, //
    @Body('author') author?: string, //
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, author, title, content)
  }

  /*** 5) DELETE /posts/:id
   * id에 해당하는 post를 삭제한다
   */
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id)
  }
}