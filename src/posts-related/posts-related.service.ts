import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  PostResponseDto,
  PostsListResponseDto,
  PostDetailResponseDto,
} from '../posts/dto/post-response.dto';
import { CreateRelatedPostInputDto } from './dto/create-related-post-input.dto';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * Servicio encargado de gestionar los posts relacionados
 * Utiliza Firebase Firestore para almacenar y recuperar posts relacionados
 * Los posts relacionados siguen la misma estructura que PostResponseDto
 */
@Injectable()
export class PostsRelatedService {
  private readonly collectionName = 'relatedPosts';

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Obtiene todos los posts relacionados desde Firestore
   * @returns Lista de posts relacionados con estructura PostsListResponseDto
   */
  async findAllRelated(): Promise<PostsListResponseDto> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const snapshot = await firestore.collection(this.collectionName).get();

      // Convertir los documentos de Firestore a PostResponseDto
      const posts: PostResponseDto[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Firestore almacena el ID como string, pero PostResponseDto espera number
        const post: PostResponseDto = {
          id: parseInt(doc.id, 10) || 0,
          attributes: data.attributes as PostResponseDto['attributes'],
        };
        posts.push(post);
      });

      // Ordenar por ID descendente (más recientes primero)
      posts.sort((a, b) => b.id - a.id);

      // Envolver la respuesta en PostsListResponseDto
      return {
        data: posts,
        meta: {
          pagination: {
            page: 1,
            pageSize: posts.length,
            pageCount: 1,
            total: posts.length,
          },
        },
      };
    } catch (error: unknown) {
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Error detallado al obtener posts relacionados:', error);
      throw new HttpException(
        `Error al obtener posts relacionados: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene un post relacionado por su ID desde Firestore
   * @param id - ID del post relacionado a obtener
   * @returns Post relacionado con estructura PostDetailResponseDto
   * @throws HttpException si el post no existe
   */
  async findRelatedById(id: number): Promise<PostDetailResponseDto> {
    try {
      const firestore = this.firebaseService.getFirestore();
      const docRef = firestore.collection(this.collectionName).doc(id.toString());
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new HttpException(
          `Post relacionado con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const data = doc.data();
      if (!data) {
        throw new HttpException(
          `Post relacionado con ID ${id} no tiene datos`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Construir el PostResponseDto
      const post: PostResponseDto = {
        id: parseInt(doc.id, 10) || id,
        attributes: data.attributes as PostResponseDto['attributes'],
      };

      // Envolver en PostDetailResponseDto
      return {
        data: post,
        meta: {},
      };
    } catch (error: unknown) {
      // Si ya es un HttpException, relanzarlo
      if (error instanceof HttpException) {
        throw error;
      }

      // Si es otro tipo de error, lanzar un error genérico
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Error al obtener post relacionado por ID:', error);
      throw new HttpException(
        `Error al obtener post relacionado: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Crea un nuevo post relacionado en Firestore
   * Lee el contenido de newPost.txt para el body
   * Construye un objeto con forma de PostResponseDto
   * @param dto - DTO con título y URL de imagen
   * @returns Post relacionado creado con estructura PostDetailResponseDto
   */
  async createRelated(
    dto: CreateRelatedPostInputDto,
  ): Promise<PostDetailResponseDto> {
    try {
      // Leer el contenido de newPost.txt
      const newPostPath = join(process.cwd(), 'src', 'assets', 'newPost.txt');
      let bodyContent: string;
      try {
        bodyContent = readFileSync(newPostPath, 'utf-8');
      } catch (fileError) {
        throw new HttpException(
          'Error al leer el archivo newPost.txt',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Obtener la fecha actual en formato ISO
      const now = new Date().toISOString();

      // Obtener el siguiente ID disponible
      // En Firestore, podemos usar un timestamp o generar un ID único
      // Usaremos un timestamp como ID para mantener compatibilidad
      const timestamp = Date.now();

      // SOLUCIÓN AL PROBLEMA: La data URL base64 puede exceder el límite de 1 MiB de Firestore
      // Si la URL es una data URL base64, debemos subirla a Cloud Storage primero
      let finalImageUrl = dto.coverImageUrl || '';

      // Verificar si es una data URL base64
      if (dto.coverImageUrl.startsWith('data:image/')) {
        console.log('📤 Detectada data URL base64, subiendo a Cloud Storage...');
        
        // Verificar el tamaño de la data URL
        const dataUrlSize = dto.coverImageUrl.length;
        const sizeInMB = dataUrlSize / 1024 / 1024;
        console.log(`📏 Tamaño de la data URL: ${dataUrlSize} bytes (${sizeInMB.toFixed(2)} MB)`);

        // Si excede 1 MiB, definitivamente necesitamos subirla a Storage
        if (dataUrlSize > 1048576) {
          console.log('⚠️ Data URL excede 1 MiB, subiendo a Cloud Storage...');
        }

        // Generar nombre único para el archivo
        const fileExtension = dto.coverImageUrl.match(/data:image\/(\w+);base64/)?.[1] || 'png';
        const fileName = `cover-${timestamp}.${fileExtension}`;

        // Subir a Cloud Storage
        try {
          finalImageUrl = await this.firebaseService.uploadImageFromDataUrl(
            dto.coverImageUrl,
            fileName,
          );
          console.log('✅ Imagen subida a Cloud Storage, URL:', finalImageUrl);
        } catch (storageError) {
          console.error('❌ Error al subir imagen a Storage:', storageError);
          throw new HttpException(
            'Error al subir la imagen a Cloud Storage',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        console.log('✅ URL de imagen es una URL normal, no requiere subida a Storage');
      }

      // Construir el objeto con forma de PostResponseDto
      // Ahora usamos la URL de Storage (mucho más corta) en lugar de la data URL base64
      const coverImgAttributes = Object.assign({}, {
        name: 'custom-related-cover.png',
        url: finalImageUrl, // URL de Storage o URL normal (no data URL base64)
      });
      
      const coverImgData = Object.assign({}, {
        id: timestamp,
        attributes: coverImgAttributes,
      });
      
      const coverImg = Object.assign({}, {
        data: coverImgData,
      });
      
      const attributes = Object.assign({}, {
        title: dto.title || '',
        subtitle: 'Exploring the Challenges and Opportunities',
        topic: 'Diversity & Inclusion',
        author: 'John Doe',
        readTime: 10,
        body: bodyContent || '',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
        coverImg: coverImg,
      });
      
      // Usar Object.assign para crear un objeto nuevo y evitar referencias compartidas
      const newPostData = Object.assign({}, {
        attributes: attributes,
      });

      // Guardar en Firestore usando el timestamp como ID del documento
      const firestore = this.firebaseService.getFirestore();
      const docRef = firestore
        .collection(this.collectionName)
        .doc(timestamp.toString());

      // Función helper para limpiar el objeto y eliminar valores undefined
      // Firestore NO acepta undefined, solo null o valores primitivos
      const cleanForFirestore = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return null;
        }
        if (typeof obj !== 'object') {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map(cleanForFirestore);
        }
        // Es un objeto plano - limpiarlo
        const cleaned: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            // Convertir undefined a null (Firestore no acepta undefined)
            if (value === undefined) {
              cleaned[key] = null;
            } else {
              cleaned[key] = cleanForFirestore(value);
            }
          }
        }
        return cleaned;
      };

      // Limpiar el objeto para Firestore
      const cleanedData = cleanForFirestore(newPostData);

      // Log detallado ANTES de guardar (como sugiere la IA de Firebase)
      const imageUrlLength = cleanedData.attributes?.coverImg?.data?.attributes?.url?.length || 0;
      const finalImageUrlInData = cleanedData.attributes?.coverImg?.data?.attributes?.url || '';
      console.log('📤 Datos que se enviarán a Firestore:', JSON.stringify(cleanedData, null, 2));
      console.log('📋 Resumen:', {
        collection: this.collectionName,
        docId: timestamp.toString(),
        hasAttributes: !!cleanedData.attributes,
        hasCoverImg: !!cleanedData.attributes?.coverImg,
        hasCoverImgData: !!cleanedData.attributes?.coverImg?.data,
        hasCoverImgAttributes: !!cleanedData.attributes?.coverImg?.data?.attributes,
        imageUrlLength: imageUrlLength,
        imageUrlSizeMB: (imageUrlLength / 1024 / 1024).toFixed(2),
        bodyLength: bodyContent?.length || 0,
        isDataUrl: finalImageUrlInData.startsWith('data:image/'),
        isStorageUrl: finalImageUrlInData.includes('storage.googleapis.com'),
      });

      // Guardar los datos limpiados
      await docRef.set(cleanedData);
      console.log('✅ Post guardado exitosamente en Firestore');
      
      // Construir el PostResponseDto completo con el ID para la respuesta
      const createdPost: PostResponseDto = {
        id: timestamp,
        attributes: newPostData.attributes as PostResponseDto['attributes'],
      };

      // Envolver la respuesta en PostDetailResponseDto
      return {
        data: createdPost,
        meta: {},
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Mejorar el manejo de errores para obtener más información
      let errorMessage = 'Error desconocido';
      let errorCode = '';
      let errorDetails: any = null;

      if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = (error as any).code || '';
        errorDetails = (error as any).details || null;
      }

      // Log detallado del error
      console.error('❌ Error detallado al crear post relacionado:', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        error: error,
      });

      // Si es un error de Firestore, proporcionar más contexto
      if (errorCode === 'PERMISSION_DENIED') {
        throw new HttpException(
          `Error de permisos en Firestore: ${errorMessage}. Verifica las reglas de seguridad de Firestore y los permisos del Service Account.`,
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        `Error al crear post relacionado: ${errorMessage}${errorCode ? ` (Código: ${errorCode})` : ''}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

