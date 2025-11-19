# Backend Litebox Challenge

Backend desarrollado con NestJS para el Challenge Litebox. Proporciona endpoints para obtener posts desde una API externa y gestionar posts relacionados usando Firebase Firestore y Cloud Storage.

## 🚀 Características

- **API Externa**: Consume la API de Litebox (`https://lite-tech-api.litebox.ai`) para obtener posts
- **Firebase Firestore**: Almacena posts relacionados creados desde el frontend
- **Cloud Storage**: Sube automáticamente imágenes base64 a Firebase Storage
- **CORS Configurable**: Soporte para múltiples orígenes mediante variables de entorno
- **Validación Automática**: Validación de DTOs con `class-validator`

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase con proyecto creado
- Service Account de Firebase con permisos de Firestore y Storage

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# O con yarn
yarn install
```

## ⚙️ Configuración

### 1. Configurar Firebase

#### Obtener Credenciales de Service Account

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o créalo)
3. Ve a **Project Settings** → **Service Accounts**
4. Haz clic en **Generate New Private Key**
5. Descarga el archivo JSON

#### Colocar Credenciales

**Desarrollo Local:**
- Coloca el archivo JSON en `src/config/firebase-service-account.json`

**Producción (Railway):**
- Opción 1: Coloca el archivo en la raíz como `firebase-service-account.json`
- Opción 2: Usa variable de entorno `FIREBASE_SERVICE_ACCOUNT_PATH` con la ruta al archivo

### 2. Habilitar Firebase Services

#### Firestore Database

1. Ve a [Firebase Console - Firestore](https://console.firebase.google.com/project/dbliteboxchallenge/firestore)
2. Haz clic en **Create database**
3. Selecciona **Start in test mode** (desarrollo) o **Start in production mode** (producción)
4. Selecciona ubicación (recomendado: `us-central1`)
5. Haz clic en **Enable**

#### Cloud Storage (Requerido para imágenes)

1. Ve a [Firebase Console - Storage](https://console.firebase.google.com/project/dbliteboxchallenge/storage)
2. Haz clic en **Get started**
3. Selecciona **Start in test mode** (desarrollo) o **Start in production mode** (producción)
4. Selecciona la misma ubicación que Firestore
5. Haz clic en **Done**

**Nota**: El bucket se crea automáticamente. Puede tener dos formatos:
- Nuevo: `{project_id}.firebasestorage.app` (usado por defecto)
- Clásico: `{project_id}.appspot.com`

### 3. Configurar Permisos del Service Account

1. Ve a [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam?project=dbliteboxchallenge)
2. Busca tu Service Account (ej: `firebase-adminsdk-xxxxx@dbliteboxchallenge.iam.gserviceaccount.com`)
3. Verifica que tenga estos roles:
   - **Cloud Datastore User** (para Firestore)
   - **Storage Admin** o **Storage Object Admin** (para Storage)

### 4. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor (Railway asigna automáticamente en producción)
PORT=3001

# Ruta al archivo de credenciales (opcional, solo si no está en ubicación por defecto)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Nombre del bucket de Storage (opcional)
# Por defecto usa: {project_id}.firebasestorage.app
FIREBASE_STORAGE_BUCKET=dbliteboxchallenge.firebasestorage.app

# Orígenes permitidos para CORS (separados por comas)
ALLOWED_ORIGINS=http://localhost:3000,https://tu-frontend.vercel.app
```

**Para producción (Railway)**, configura estas variables en el dashboard de Railway. Ver `CREDENTIALS-BACK.txt` para más detalles.

## 🏃 Desarrollo

```bash
# Modo desarrollo (con watch)
npm run start:dev

# Modo producción
npm run start:prod

# Build
npm run build
```

La aplicación estará disponible en [http://localhost:3001](http://localhost:3001)

## 🏗️ Estructura del Proyecto

```
back-litebox-challenge/
├── src/
│   ├── app.module.ts              # Módulo raíz
│   ├── main.ts                    # Punto de entrada
│   ├── firebase/                  # Módulo de Firebase
│   │   ├── firebase.module.ts     # Módulo de Firebase
│   │   └── firebase.service.ts    # Servicio de Firebase (Firestore y Storage)
│   ├── posts/                     # Módulo de posts (API externa)
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── services/              # Servicios especializados
│   │   │   └── external-api.service.ts  # Consume API externa
│   │   ├── posts.controller.ts    # Controlador HTTP
│   │   ├── posts.service.ts       # Servicio principal
│   │   └── posts.module.ts        # Módulo NestJS
│   └── posts-related/             # Módulo de posts relacionados (Firebase)
│       ├── dto/                   # Data Transfer Objects
│       ├── posts-related.controller.ts  # Controlador HTTP
│       ├── posts-related.service.ts     # Servicio (Firestore)
│       └── posts-related.module.ts      # Módulo NestJS
├── src/assets/
│   └── newPost.txt                # Contenido Markdown para nuevos posts
└── src/config/
    └── firebase-service-account.json  # Credenciales de Firebase (NO subir a Git)
```

## 📡 Endpoints Disponibles

### Posts (API Externa)

#### `GET /api/posts`
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

#### `GET /api/posts/:id`
Obtiene el detalle de un post específico. Si el post no existe en la API externa, intenta buscarlo en Firebase.

**Parámetros:**
- `id` (number): ID del post

**Respuesta:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "...",
      "body": "...",
      ...
    }
  },
  "meta": {}
}
```

### Posts Relacionados (Firebase)

#### `GET /api/posts/related`
Obtiene todos los posts relacionados almacenados en Firebase Firestore.

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1234567890,
      "attributes": {
        "title": "Mi nuevo post",
        "topic": "Tech",
        "author": "Usuario",
        "readTime": 5,
        "body": "# Contenido Markdown...",
        "coverImg": {
          "data": {
            "id": 1,
            "attributes": {
              "url": "https://storage.googleapis.com/..."
            }
          }
        }
      }
    }
  ],
  "meta": {}
}
```

#### `POST /api/post/related`
Crea un nuevo post relacionado en Firebase Firestore.

**Body:**
```json
{
  "title": "Título del post",
  "coverImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Nota**: Si `coverImageUrl` es una data URL base64, se sube automáticamente a Cloud Storage y se guarda la URL pública en Firestore.

**Respuesta:**
```json
{
  "data": {
    "id": 1234567890,
    "attributes": {
      "title": "Título del post",
      "subtitle": "Subtitle",
      "topic": "Tech",
      "author": "Natsu Kim",
      "readTime": 5,
      "body": "# Contenido desde newPost.txt...",
      "coverImg": {
        "data": {
          "id": 1,
          "attributes": {
            "url": "https://storage.googleapis.com/..."
          }
        }
      }
    }
  },
  "meta": {}
}
```

## 🔄 Flujo de Datos

### Posts Principales
1. Frontend → `GET /api/posts` → Backend
2. Backend → API Externa (`https://lite-tech-api.litebox.ai`) → Backend
3. Backend → Frontend (respuesta)

### Posts Relacionados (Creación)
1. Frontend → `POST /api/post/related` (con data URL base64) → Backend
2. Backend detecta data URL base64
3. Backend → Cloud Storage (sube imagen) → URL pública
4. Backend lee `src/assets/newPost.txt` (contenido Markdown)
5. Backend → Firestore (guarda post con URL de Storage)
6. Backend → Frontend (respuesta con post creado)

### Posts Relacionados (Lectura)
1. Frontend → `GET /api/posts/related` → Backend
2. Backend → Firestore (lee posts) → Backend
3. Backend → Frontend (respuesta)

## 🎨 Tecnologías Utilizadas

- **NestJS 11**: Framework Node.js
- **TypeScript**: Tipado estático
- **Firebase Admin SDK**: Firestore y Cloud Storage
- **Axios**: Cliente HTTP para API externa
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos

## 🚀 Despliegue en Railway

### Pasos para Desplegar

1. **Conectar repositorio** a Railway
2. **Configurar variables de entorno** (ver `CREDENTIALS-BACK.txt`)
3. **Subir credenciales de Firebase**:
   - Opción 1: Coloca `firebase-service-account.json` en la raíz del proyecto
   - Opción 2: Usa variable de entorno `FIREBASE_SERVICE_ACCOUNT_PATH`
4. **Build automático**: Railway detecta NestJS automáticamente
5. **Deploy**: Se despliega automáticamente en cada push

### Variables de Entorno en Railway

Ve a **Variables** y agrega:

```
PORT=3001
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=dbliteboxchallenge.firebasestorage.app
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo (con watch)
npm run start:dev

# Producción
npm run start:prod

# Build
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Linter
npm run lint

# Formateo
npm run format
```

## 📝 Notas Importantes

- **Imágenes Base64**: Se suben automáticamente a Cloud Storage para evitar exceder el límite de 1 MiB por campo en Firestore
- **Contenido de Posts**: El contenido Markdown se lee desde `src/assets/newPost.txt`
- **CORS**: Configurado para permitir peticiones desde el frontend. En producción, especifica los orígenes permitidos
- **Admin SDK**: El Admin SDK de Firebase bypasea las reglas de seguridad, así que los permisos se gestionan en Google Cloud IAM

## 🔧 Solución de Problemas

### Error: "Cloud Firestore API has not been used"
- **Solución**: Habilita la API de Cloud Firestore en [Google Cloud Console](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=dbliteboxchallenge)

### Error: "Bucket not found"
- **Solución**: Habilita Firebase Storage en [Firebase Console](https://console.firebase.google.com/project/dbliteboxchallenge/storage). El bucket se crea automáticamente.

### Error: "PERMISSION_DENIED"
- **Solución**: Verifica que el Service Account tenga los roles correctos en [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam?project=dbliteboxchallenge)

### Las imágenes no se muestran (403 Forbidden)
- **Solución**: Verifica las reglas de Storage en Firebase Console. Para desarrollo, permite lectura pública.

## 🔗 Enlaces Útiles

- [Documentación NestJS](https://docs.nestjs.com)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Cloud Storage](https://firebase.google.com/docs/storage)
- [Railway Documentation](https://docs.railway.app)

## 📄 Licencia

Este proyecto es parte del Challenge Litebox.
