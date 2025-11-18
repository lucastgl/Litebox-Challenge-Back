# Módulo de Posts

Este módulo gestiona todas las operaciones relacionadas con posts, incluyendo la integración con la API externa de Litebox y la gestión de posts relacionados.

## Estructura del Módulo

```
posts/
├── dto/                          # Data Transfer Objects
│   ├── post-response.dto.ts      # DTOs para respuestas de la API externa
│   ├── create-related-post.dto.ts # DTO para crear posts relacionados
│   └── related-post-response.dto.ts # DTO para respuestas de posts relacionados
├── services/                      # Servicios especializados
│   ├── external-api.service.ts   # Servicio para consumir la API externa
│   └── related-posts.service.ts  # Servicio para gestionar posts relacionados
├── posts.controller.ts           # Controlador HTTP
├── posts.service.ts              # Servicio principal (lógica de negocio)
└── posts.module.ts               # Módulo NestJS
```

## Endpoints Disponibles

### 1. GET /api/posts
Obtiene el listado completo de posts desde la API externa de Litebox.

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Breaking Down Diversity & Inclusion in Tech",
        "subtitle": "Exploring the Challenges and Opportunities",
        "topic": "Diversity & Inclusion",
        "author": "John Doe",
        "readTime": 10,
        "body": "<p>...</p>",
        "createdAt": "2024-04-02T23:19:59.939Z",
        "updatedAt": "2024-04-02T23:47:50.511Z",
        "publishedAt": "2024-04-02T23:47:50.509Z",
        "coverImg": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "tech1.png",
              "url": "/uploads/tech1_9a4a3f0f6b.png"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 14
    }
  }
}
```

### 2. GET /api/posts/:id
Obtiene el detalle de un post específico por su ID.

**Parámetros:**
- `id` (number): ID del post

**Respuesta:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Breaking Down Diversity & Inclusion in Tech",
      ...
    }
  },
  "meta": {}
}
```

### 3. GET /api/posts/related
Obtiene el listado de posts relacionados almacenados localmente (los que se cargan desde el modal).

**Respuesta:**
```json
[
  {
    "id": 1,
    "title": "Título del post relacionado",
    "image": "https://example.com/image.jpg",
    "createdAt": "2025-01-20T10:00:00.000Z"
  }
]
```

### 4. POST /api/posts/related
Crea un nuevo post relacionado con título e imagen.

**Body:**
```json
{
  "title": "Título del post",
  "image": "https://example.com/image.jpg"
}
```

**Validaciones:**
- `title`: Requerido, debe ser una cadena no vacía
- `image`: Requerido, debe ser una URL válida

**Respuesta:**
```json
{
  "id": 1,
  "title": "Título del post",
  "image": "https://example.com/image.jpg",
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

## Capas de la Arquitectura

### 1. Controlador (PostsController)
- Maneja las peticiones HTTP
- Valida parámetros de entrada
- Delega la lógica de negocio al servicio

### 2. Servicio Principal (PostsService)
- Coordina las operaciones entre servicios especializados
- Actúa como capa de lógica de negocio
- No contiene lógica de acceso a datos

### 3. Servicios Especializados

#### ExternalApiService
- Consume la API externa de Litebox (`https://lite-tech-api.litebox.ai`)
- Maneja errores HTTP y transforma respuestas
- Proporciona métodos para obtener posts y detalles

#### RelatedPostsService
- Gestiona los posts relacionados almacenados localmente
- Actualmente usa almacenamiento en memoria (en producción debería usar una base de datos)
- Proporciona métodos para crear y listar posts relacionados

### 4. DTOs (Data Transfer Objects)
- Definen la estructura de datos para requests y responses
- Proporcionan validación automática con `class-validator`
- Facilitan la transformación de tipos

## Notas de Implementación

1. **Almacenamiento de Posts Relacionados**: Actualmente se almacenan en memoria. En producción, se recomienda usar una base de datos (PostgreSQL, MongoDB, etc.).

2. **Manejo de Errores**: Los errores de la API externa se capturan y se transforman en excepciones HTTP apropiadas.

3. **Validación**: Se utiliza `ValidationPipe` global para validar automáticamente todos los DTOs.

4. **CORS**: Está habilitado para permitir peticiones desde el frontend. En producción, se debe especificar los orígenes permitidos.

5. **Orden de Rutas**: La ruta `/api/posts/related` debe estar antes de `/api/posts/:id` para evitar conflictos de routing.

## Próximos Pasos

- [ ] Integrar una base de datos para almacenar posts relacionados
- [ ] Agregar autenticación y autorización
- [ ] Implementar caché para las peticiones a la API externa
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar paginación para posts relacionados
- [ ] Agregar logging y monitoreo

