import { Module } from '@nestjs/common';
import { PostsRelatedController } from './posts-related.controller';
import { PostsRelatedService } from './posts-related.service';
import { FirebaseModule } from '../firebase/firebase.module';

/**
 * Módulo de posts relacionados
 * Gestiona los posts relacionados que se crean desde el modal
 * Utiliza Firebase Firestore para almacenamiento y sigue la misma estructura que PostResponseDto
 */
@Module({
  imports: [FirebaseModule],
  controllers: [PostsRelatedController],
  providers: [PostsRelatedService],
  exports: [PostsRelatedService],
})
export class PostsRelatedModule {}

