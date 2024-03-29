import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ConfigModule } from '@nestjs/config'

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PostsModule } from './posts/posts.module'
import { PostsModel } from './posts/entity/posts.entity'
import { UsersModule } from './users/users.module'
import { UsersModel } from './users/entity/users.entity'
import { AuthModule } from './auth/auth.module'
import { CommonModule } from './common/common.module'
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const'
import { PUBLIC_FOLDER_PATH } from './common/const/path.const'
import { ImageModel } from './common/entity/image.entity'
import { LogMiddleware } from './common/middleware/log.middleware'
import { ChatsModule } from './chats/chats.module'
import { ChatsModel } from './chats/entity/chats.entity'
import { MessagesModel } from './chats/messages/entitiy/messages.entity'
import { CommentsModule } from './posts/comments/comments.module'
import { CommentsModel } from './posts/comments/entity/comments.entity'
import { RolesGuard } from './users/guard/roles.guard'
import { AccessTokenGuard } from './auth/guard/bearer-token.guard'
import { UserFollowersModel } from './users/entity/user-followers.entity'

@Module({
  imports: [
    PostsModule,
    /***
     * http://localhost:3000/public/posts/4022.jpg
     * http://localhost:3000/posts/4022.jpg
     */
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // 데이터베이스 타입
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      // entities폴더에 작성한 PostsModel 가져오기
      entities: [
        PostsModel, //
        UsersModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
        UserFollowersModel,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '*', // 뒤에 어떤 글자이든 적용(와일드카드)
      method: RequestMethod.ALL, // 모든 요청에 적용
    })
  }
}
