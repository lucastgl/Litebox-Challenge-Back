import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  PostsListResponseDto,
  PostDetailResponseDto,
} from './dto/post-response.dto';
import { RelatedPostResponseDto } from './dto/related-post-response.dto';
import { CreateRelatedPostDto } from './dto/create-related-post.dto';

/**
 * Controlador de posts
 * Maneja todas las peticiones HTTP relacionadas con posts
 * Define los endpoints y delega la lógica de negocio al servicio
 */
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
   * Obtiene el listado de posts relacionados almacenados localmente
   * Estos son los posts que se cargan desde el modal
   * IMPORTANTE: Esta ruta debe estar antes de /:id para evitar conflictos de routing
   * @returns Array con todos los posts relacionados
   */
  @Get('related')
  async getRelatedPosts(): Promise<RelatedPostResponseDto[]> {
    return this.postsService.getRelatedPosts();
  }

  /**
   * GET /api/posts/:id
   * Obtiene el detalle de un post específico por su ID desde la API externa
   * @param id - ID del post a obtener (validado como número entero)
   * @returns Datos del post solicitado
   */
  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.getPostById(id);
  }

  /**
   * POST /api/posts/related
   * Crea un nuevo post relacionado con título e imagen
   * Valida que se proporcione un título válido y una URL de imagen válida
   * @param createRelatedPostDto - DTO con los datos del post a crear
   * @returns El post relacionado creado con su ID y fecha de creación
   */
  @Post('related')
  @HttpCode(HttpStatus.CREATED)
  async createRelatedPost(
    @Body() createRelatedPostDto: CreateRelatedPostDto,
  ): Promise<RelatedPostResponseDto> {
    return this.postsService.createRelatedPost(createRelatedPostDto);
  }
}

