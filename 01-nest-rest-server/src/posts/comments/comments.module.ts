import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { PostExistsMiddelware } from './middleware/post-exists.middleware'
import { CommentsModel } from './entity/comments.entity'
import { CommonModule } from 'src/common/common.module'
import { PostsModule } from '../posts.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]), //
    CommonModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddelware).forRoutes(CommentsController)
  }
}
