import { Injectable } from '@nestjs/common';
import { RelatedPostResponseDto } from '../dto/related-post-response.dto';
import { CreateRelatedPostDto } from '../dto/create-related-post.dto';

/**
 * Servicio encargado de gestionar los posts relacionados
 * Almacena los posts relacionados en memoria (en producción se debería usar una base de datos)
 * Proporciona métodos para crear y listar posts relacionados
 */
@Injectable()
export class RelatedPostsService {
  /**
   * Almacenamiento en memoria de los posts relacionados
   * En producción, esto debería ser reemplazado por una base de datos
   */
  private relatedPosts: RelatedPostResponseDto[] = [];
  private nextId = 1;

  /**
   * Crea un nuevo post relacionado
   * @param createRelatedPostDto - DTO con los datos del post a crear (título e imagen)
   * @returns El post relacionado creado con su ID y fecha de creación
   */
  createRelatedPost(
    createRelatedPostDto: CreateRelatedPostDto,
  ): Promise<RelatedPostResponseDto> {
    const newPost: RelatedPostResponseDto = {
      id: this.nextId++,
      title: createRelatedPostDto.title,
      image: createRelatedPostDto.image,
      createdAt: new Date(),
    };

    this.relatedPosts.push(newPost);
    return Promise.resolve(newPost);
  }

  /**
   * Obtiene todos los posts relacionados almacenados
   * @returns Array con todos los posts relacionados, ordenados por fecha de creación (más recientes primero)
   */
  getAllRelatedPosts(): Promise<RelatedPostResponseDto[]> {
    // Ordenar por fecha de creación descendente (más recientes primero)
    return Promise.resolve(
      [...this.relatedPosts].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    );
  }

  /**
   * Obtiene un post relacionado por su ID
   * @param id - ID del post relacionado
   * @returns El post relacionado si existe, null en caso contrario
   */
  getRelatedPostById(id: number): Promise<RelatedPostResponseDto | null> {
    return Promise.resolve(
      this.relatedPosts.find((post) => post.id === id) || null,
    );
  }
}
