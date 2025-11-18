import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ExternalApiService } from './services/external-api.service';
import { RelatedPostsService } from './services/related-posts.service';

/**
 * Módulo de posts
 * Organiza todos los componentes relacionados con la gestión de posts:
 * - Controlador: maneja las peticiones HTTP
 * - Servicios: lógica de negocio y consumo de APIs
 * - HttpModule: necesario para realizar peticiones HTTP a la API externa
 */
@Module({
  imports: [HttpModule],
  controllers: [PostsController],
  providers: [PostsService, ExternalApiService, RelatedPostsService],
  exports: [PostsService],
})
export class PostsModule {}

