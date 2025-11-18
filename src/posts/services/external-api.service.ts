import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PostsListResponseDto,
  PostDetailResponseDto,
} from '../dto/post-response.dto';

/**
 * Servicio encargado de consumir la API externa de Litebox
 * Maneja todas las peticiones HTTP a la API externa y transforma las respuestas
 */
@Injectable()
export class ExternalApiService {
  private readonly baseUrl = 'https://lite-tech-api.litebox.ai';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene el listado completo de posts desde la API externa
   * @returns Promise con la lista de posts y metadatos de paginación
   * @throws HttpException si hay un error al consumir la API externa
   */
  async getAllPosts(): Promise<PostsListResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PostsListResponseDto>(`${this.baseUrl}/api/posts`),
      );
      return response.data;
    } catch {
      throw new HttpException(
        'Error al obtener los posts desde la API externa',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Obtiene el detalle de un post específico por su ID
   * @param id - ID del post a obtener
   * @returns Promise con los datos del post
   * @throws HttpException si el post no existe o hay un error al consumir la API
   */
  async getPostById(id: number): Promise<PostDetailResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PostDetailResponseDto>(
          `${this.baseUrl}/api/posts/${id}`,
        ),
      );
      return response.data;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 404
      ) {
        throw new HttpException(
          `Post con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Error al obtener el post desde la API externa',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
