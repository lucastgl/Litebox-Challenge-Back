/**
 * DTO para la respuesta de un post desde la API externa
 * Representa la estructura de datos que se recibe de la API de Litebox
 */
export class PostResponseDto {
  id: number;
  attributes: {
    title: string;
    subtitle: string | null;
    topic: string;
    author: string;
    readTime: number;
    body: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    coverImg: {
      data: {
        id: number;
        attributes: {
          name: string;
          url: string;
        };
      } | null;
    };
  };
}

/**
 * DTO para la respuesta de la lista de posts
 * Incluye los datos y la información de paginación
 */
export class PostsListResponseDto {
  data: PostResponseDto[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * DTO para la respuesta de un post individual
 */
export class PostDetailResponseDto {
  data: PostResponseDto;
  meta: Record<string, unknown>;
}
