import { Injectable } from '@nestjs/common';
import { ExternalApiService } from './services/external-api.service';
import { RelatedPostsService } from './services/related-posts.service';
import {
  PostsListResponseDto,
  PostDetailResponseDto,
} from './dto/post-response.dto';
import { RelatedPostResponseDto } from './dto/related-post-response.dto';
import { CreateRelatedPostDto } from './dto/create-related-post.dto';

/**
 * Servicio principal de posts
 * Coordina las operaciones entre el servicio de API externa y el servicio de posts relacionados
 * Actúa como capa de lógica de negocio para el módulo de posts
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly relatedPostsService: RelatedPostsService,
  ) {}

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

  /**
   * Obtiene todos los posts relacionados almacenados localmente
   * @returns Array con todos los posts relacionados
   */
  async getRelatedPosts(): Promise<RelatedPostResponseDto[]> {
    return this.relatedPostsService.getAllRelatedPosts();
  }

  /**
   * Crea un nuevo post relacionado
   * @param createRelatedPostDto - DTO con los datos del post a crear (título e imagen)
   * @returns El post relacionado creado
   */
  async createRelatedPost(
    createRelatedPostDto: CreateRelatedPostDto,
  ): Promise<RelatedPostResponseDto> {
    return this.relatedPostsService.createRelatedPost(createRelatedPostDto);
  }
}

