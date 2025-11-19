import { Injectable } from '@nestjs/common';
import { ExternalApiService } from './services/external-api.service';
import {
  PostsListResponseDto,
  PostDetailResponseDto,
} from './dto/post-response.dto';

/**
 * Servicio principal de posts
 * Coordina las operaciones con el servicio de API externa
 * Los posts relacionados se manejan en PostsRelatedService
 */
@Injectable()
export class PostsService {
  constructor(private readonly externalApiService: ExternalApiService) {}

  /**
   * Obtiene el listado completo de posts desde la API externa
   * @returns Promise con la lista de posts y metadatos de paginación
   */
  async getAllPosts(): Promise<PostsListResponseDto> {
    return this.externalApiService.getAllPosts();
  }

  /**
   * Obtiene el detalle de un post específico por su ID desde la API externa
   * @param id - ID del post a obtener
   * @returns Promise con los datos del post
   */
  async getPostById(id: number): Promise<PostDetailResponseDto> {
    return this.externalApiService.getPostById(id);
  }
}
