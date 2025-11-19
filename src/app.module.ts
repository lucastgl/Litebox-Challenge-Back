import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { PostsRelatedModule } from './posts-related/posts-related.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [FirebaseModule, PostsModule, PostsRelatedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
