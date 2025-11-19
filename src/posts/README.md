# Módulo de Posts

Este módulo gestiona las operaciones relacionadas con posts de la API externa de Litebox.

**Nota:** Los posts relacionados (creados desde el modal) se gestionan en el módulo `posts-related` que utiliza Firebase Firestore.

## Estructura del Módulo

```
posts/
├── dto/                          # Data Transfer Objects
│   └── post-response.dto.ts      # DTOs para respuestas de la API externa
├── services/                      # Servicios especializados
│   └── external-api.service.ts   # Servicio para consumir la API externa
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

**Nota:** Los posts relacionados se gestionan en el módulo `posts-related` que utiliza Firebase Firestore.

### 4. DTOs (Data Transfer Objects)
- Definen la estructura de datos para requests y responses
- Proporcionan validación automática con `class-validator`
- Facilitan la transformación de tipos

## Notas de Implementación

1. **Manejo de Errores**: Los errores de la API externa se capturan y se transforman en excepciones HTTP apropiadas.

2. **Validación**: Se utiliza `ValidationPipe` global para validar automáticamente todos los DTOs.

3. **CORS**: Está habilitado para permitir peticiones desde el frontend. En producción, se debe especificar los orígenes permitidos mediante la variable de entorno `ALLOWED_ORIGINS`.

4. **Posts Relacionados**: Los posts relacionados (creados desde el modal) se gestionan en el módulo `posts-related` que utiliza Firebase Firestore. Ver documentación en `src/posts-related/`.

## Próximos Pasos

- [ ] Agregar autenticación y autorización
- [ ] Implementar caché para las peticiones a la API externa
- [ ] Agregar tests unitarios y de integración
- [ ] Agregar logging y monitoreo

