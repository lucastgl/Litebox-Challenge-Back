import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ExternalApiService } from './services/external-api.service';
import { PostsRelatedModule } from '../posts-related/posts-related.module';

/**
 * Módulo de posts
 * Organiza todos los componentes relacionados con la gestión de posts de la API externa:
 * - Controlador: maneja las peticiones HTTP
 * - Servicios: lógica de negocio y consumo de APIs externas
 * - HttpModule: necesario para realizar peticiones HTTP a la API externa
 * 
 * Nota: Los posts relacionados se manejan en PostsRelatedModule
 */
@Module({
  imports: [HttpModule, PostsRelatedModule],
  controllers: [PostsController],
  providers: [PostsService, ExternalApiService],
  exports: [PostsService],
})
export class PostsModule {}

