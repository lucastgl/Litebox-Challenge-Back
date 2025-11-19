import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  PostsListResponseDto,
  PostDetailResponseDto,
} from './dto/post-response.dto';
import { PostsRelatedService } from '../posts-related/posts-related.service';

/**
 * Controlador de posts
 * Maneja las peticiones HTTP relacionadas con posts de la API externa
 * Los posts relacionados se manejan en PostsRelatedController
 */
@Controller('api/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsRelatedService: PostsRelatedService,
  ) {}

  /**
   * GET /api/posts
   * Obtiene el listado completo de posts desde la API externa
   * @returns Lista de posts con metadatos de paginación
   */
  @Get()
  async getAllPosts(): Promise<PostsListResponseDto> {
    return this.postsService.getAllPosts();
  }

  /**
   * GET /api/posts/related
   * Obtiene el listado de posts relacionados desde Firebase Firestore
   * IMPORTANTE: Esta ruta debe estar ANTES de @Get(':id') para evitar conflictos
   * @returns Lista de posts relacionados con estructura PostsListResponseDto
   */
  @Get('related')
  async getRelatedPosts(): Promise<PostsListResponseDto> {
    return this.postsRelatedService.findAllRelated();
  }

  /**
   * GET /api/posts/:id
   * Obtiene el detalle de un post específico por su ID
   * Primero intenta obtenerlo de la API externa
   * Si no lo encuentra (404), busca en Firebase Firestore (posts relacionados)
   * @param id - ID del post a obtener (validado como número entero)
   * @returns Datos del post solicitado
   */
  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostDetailResponseDto> {
    try {
      // Primero intentar obtener de la API externa
      return await this.postsService.getPostById(id);
    } catch (error: unknown) {
      // Si el error es 404 (no encontrado) o 502 (bad gateway), intentar buscar en Firebase
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error.status === 404 || error.status === 502)
      ) {
        console.log(
          `Post ${id} no encontrado en API externa, buscando en Firebase...`,
        );
        try {
          // Buscar en Firebase Firestore (posts relacionados)
          return await this.postsRelatedService.findRelatedById(id);
        } catch (firebaseError: unknown) {
          // Si tampoco se encuentra en Firebase, lanzar el error original de la API externa
          // para mantener la consistencia del mensaje de error
          throw error;
        }
      }
      // Si es otro tipo de error, relanzarlo
      throw error;
    }
  }
}

