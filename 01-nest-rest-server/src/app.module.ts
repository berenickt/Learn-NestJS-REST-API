import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PostsModule } from './posts/posts.module'
import { PostsModel } from './posts/entities/posts.entity'
import { UsersModule } from './users/users.module'
import { UsersModel } from './users/entities/users.entity'
import { AuthModule } from './auth/auth.module'
import { CommonModule } from './common/common.module'
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PUBLIC_FOLDER_PATH } from './common/const/path.const'

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
      entities: [PostsModel, UsersModel],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
