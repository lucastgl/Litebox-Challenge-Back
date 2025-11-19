import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsRelatedService } from './posts-related.service';
import { PostDetailResponseDto } from '../posts/dto/post-response.dto';
import { CreateRelatedPostInputDto } from './dto/create-related-post-input.dto';

/**
 * Controlador de posts relacionados
 * Maneja las peticiones HTTP relacionadas con posts relacionados
 * Estos posts se almacenan en Firebase Firestore y siguen la misma estructura que PostResponseDto
 * 
 * NOTA: GET /api/posts/related está manejado en PostsController para evitar conflictos de rutas
 */
@Controller('api')
export class PostsRelatedController {
  constructor(
    private readonly postsRelatedService: PostsRelatedService,
  ) {}

  /**
   * POST /api/post/related
   * Crea un nuevo post relacionado
   * Lee el body desde newPost.txt y construye un objeto con forma de PostResponseDto
   * @param dto - DTO con título y URL de imagen
   * @returns Post relacionado creado con estructura PostDetailResponseDto
   */
  @Post('post/related')
  @HttpCode(HttpStatus.CREATED)
  async createRelatedPost(
    @Body() dto: CreateRelatedPostInputDto,
  ): Promise<PostDetailResponseDto> {
    return this.postsRelatedService.createRelated(dto);
  }
}

