import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * Servicio de Firebase
 * Inicializa el SDK de Firebase Admin y proporciona acceso a Firestore
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;
  private storage: admin.storage.Storage;

  /**
   * Inicializa Firebase Admin SDK al iniciar el módulo
   * Lee las credenciales desde variable de entorno o archivo JSON de service account
   *
   * Prioridad:
   * 1. Variable de entorno FIREBASE_SERVICE_ACCOUNT (JSON string) - Recomendado para producción
   * 2. Variable de entorno FIREBASE_SERVICE_ACCOUNT_PATH (ruta al archivo)
   * 3. src/config/firebase-service-account.json (desarrollo local)
   * 4. firebase-service-account.json en la raíz (producción compilada)
   */
  onModuleInit() {
    try {
      let serviceAccount: admin.ServiceAccount;

      // Prioridad 1: Variable de entorno con JSON string (recomendado para Railway/Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT,
          ) as admin.ServiceAccount;
          console.log(
            '✅ Credenciales de Firebase cargadas desde variable de entorno FIREBASE_SERVICE_ACCOUNT',
          );
        } catch (parseError) {
          throw new Error(
            `Error al parsear FIREBASE_SERVICE_ACCOUNT. Debe ser un JSON válido: ${parseError}`,
          );
        }
      }
      // Prioridad 2: Variable de entorno con ruta al archivo
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(
          process.cwd(),
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        );

        if (!existsSync(serviceAccountPath)) {
          throw new Error(
            `No se encontró el archivo de credenciales en la ruta especificada: ${serviceAccountPath}`,
          );
        }

        const fileContent = readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent) as admin.ServiceAccount;
        console.log(
          `✅ Credenciales de Firebase cargadas desde archivo: ${serviceAccountPath}`,
        );
      }
      // Prioridad 3 y 4: Buscar en ubicaciones por defecto
      else {
        // Intentar desde src/config (desarrollo)
        const devPath = path.resolve(
          process.cwd(),
          'src',
          'config',
          'firebase-service-account.json',
        );
        // Intentar desde la raíz (producción compilada)
        const prodPath = path.resolve(
          process.cwd(),
          'firebase-service-account.json',
        );

        let serviceAccountPath: string;

        // Verificar cuál existe
        if (existsSync(devPath)) {
          serviceAccountPath = devPath;
        } else if (existsSync(prodPath)) {
          serviceAccountPath = prodPath;
        } else {
          throw new Error(
            `No se encontró el archivo de credenciales de Firebase. ` +
              `Buscado en: ${devPath} y ${prodPath}. ` +
              `Para producción (Railway/Vercel), configura la variable de entorno ` +
              `FIREBASE_SERVICE_ACCOUNT con el contenido JSON del archivo de credenciales.`,
          );
        }

        const fileContent = readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent) as admin.ServiceAccount;
        console.log(
          `✅ Credenciales de Firebase cargadas desde archivo: ${serviceAccountPath}`,
        );
      }

      // Inicializar Firebase Admin SDK
      if (!admin.apps.length) {
        // Obtener el nombre del bucket desde variable de entorno o usar el bucket correcto
        // El bucket puede ser: {project_id}.appspot.com (clásico) o {project_id}.firebasestorage.app (nuevo)
        // Por defecto usamos el nuevo formato: .firebasestorage.app
        const storageBucket =
          process.env.FIREBASE_STORAGE_BUCKET ||
          `${serviceAccount.projectId}.firebasestorage.app`;

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          // Para Firestore no es necesario databaseURL
          // Para Storage, se usa el bucket del proyecto
          storageBucket: storageBucket,
        });

        console.log(`📦 Bucket de Storage configurado: ${storageBucket}`);
        console.log(
          `   (Puedes cambiarlo con la variable de entorno FIREBASE_STORAGE_BUCKET)`,
        );
      }

      // Obtener instancias de Firestore y Storage
      this.firestore = admin.firestore();
      this.storage = admin.storage();

      console.log('✅ Firebase Admin SDK inicializado correctamente');
      console.log('✅ Firebase Storage inicializado correctamente');
      console.log(
        '⚠️  NOTA: Asegúrate de que el bucket de Storage esté creado en Firebase Console',
      );
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Obtiene la instancia de Firestore
   * @returns Instancia de Firestore
   */
  getFirestore(): admin.firestore.Firestore {
    if (!this.firestore) {
      throw new Error(
        'Firestore no está inicializado. Verifica la configuración de Firebase.',
      );
    }
    return this.firestore;
  }

  /**
   * Obtiene la instancia de Firebase Admin
   * @returns Instancia de Firebase Admin
   */
  getAdmin(): typeof admin {
    return admin;
  }

  /**
   * Obtiene la instancia de Firebase Storage
   * @returns Instancia de Storage
   */
  getStorage(): admin.storage.Storage {
    if (!this.storage) {
      throw new Error(
        'Storage no está inicializado. Verifica la configuración de Firebase.',
      );
    }
    return this.storage;
  }

  /**
   * Sube una imagen a Firebase Cloud Storage desde una data URL base64
   * @param dataUrl - Data URL base64 (data:image/jpeg;base64,...)
   * @param fileName - Nombre del archivo en Storage
   * @returns URL pública de la imagen subida
   */
  async uploadImageFromDataUrl(
    dataUrl: string,
    fileName: string,
  ): Promise<string> {
    try {
      // Validar que sea una data URL
      if (!dataUrl.startsWith('data:image/')) {
        throw new Error('La URL debe ser una data URL base64 válida');
      }

      // Extraer el tipo MIME y los datos base64
      const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Formato de data URL inválido');
      }

      const mimeType = matches[1]; // jpeg, png, etc.
      const base64Data = matches[2];

      // Convertir base64 a Buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Verificar el tamaño (límite de Firestore es 1 MiB por campo)
      // Si la imagen es muy grande, Storage puede manejarla mejor
      const sizeInBytes = imageBuffer.length;
      console.log(
        `📦 Tamaño de la imagen: ${sizeInBytes} bytes (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB)`,
      );

      // Obtener el bucket de Storage
      // Usar el bucket configurado en la inicialización (por defecto: {project_id}.firebasestorage.app)
      // O permitir override con variable de entorno
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || undefined;
      const bucket = this.storage.bucket(bucketName);

      console.log(`📤 Intentando subir a bucket: ${bucket.name}`);

      // Verificar que el bucket existe (esto lanzará un error si no existe)
      // El error será más claro si el bucket no existe
      try {
        const [exists] = await bucket.exists();
        if (!exists) {
          throw new Error(
            `El bucket de Storage "${bucket.name}" no existe. ` +
              `Por favor, habilita Firebase Storage en la consola: ` +
              `https://console.firebase.google.com/project/dbliteboxchallenge/storage ` +
              `y crea el bucket "${bucket.name}" o configura FIREBASE_STORAGE_BUCKET con el nombre correcto.`,
          );
        }
      } catch (checkError: unknown) {
        // Si el error es que el bucket no existe, lanzar un mensaje más claro
        const error = checkError as { code?: number; message?: string };
        if (error.code === 404 || error.message?.includes('not exist')) {
          throw new Error(
            `❌ El bucket de Storage "${bucket.name}" no existe. ` +
              `\n\n📋 Pasos para solucionarlo:\n` +
              `1. Ve a: https://console.firebase.google.com/project/dbliteboxchallenge/storage\n` +
              `2. Haz clic en "Get started" si Storage no está habilitado\n` +
              `3. Selecciona "Start in test mode" y la ubicación\n` +
              `4. Haz clic en "Done"\n` +
              `5. Espera 1-2 minutos y reinicia el servidor\n\n` +
              `El bucket debería crearse automáticamente como "${bucket.name}"`,
          );
        }
        throw checkError;
      }

      // Crear referencia al archivo
      const file = bucket.file(`related-posts/${fileName}`);

      // Configurar metadatos
      const metadata = {
        contentType: `image/${mimeType}`,
        metadata: {
          uploadedAt: new Date().toISOString(),
        },
      };

      // Subir el archivo
      await file.save(imageBuffer, {
        metadata,
        public: true, // Hacer el archivo público para acceso directo
      });

      // Obtener la URL pública
      // Opción 1: URL pública directa (si el bucket es público)
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // Opción 2: URL firmada (más segura, pero requiere configuración adicional)
      // Para ahora usamos la URL pública

      console.log(`✅ Imagen subida a Storage: ${publicUrl}`);
      return publicUrl;
    } catch (error: unknown) {
      // Mejorar el mensaje de error para el caso específico de bucket no encontrado
      const err = error as { code?: number; message?: string };
      if (
        err.code === 404 ||
        err.message?.includes('not exist') ||
        err.message?.includes('Bucket')
      ) {
        console.error(
          '❌ Error: El bucket de Storage no existe o no está configurado correctamente.',
        );
        console.error('📋 Por favor, habilita Firebase Storage en:');
        console.error(
          '   https://console.firebase.google.com/project/dbliteboxchallenge/storage',
        );
        throw new Error(
          `El bucket de Storage no existe. Habilita Firebase Storage en la consola y reinicia el servidor. ` +
            `Ver STORAGE_SETUP.md para más detalles.`,
        );
      }
      console.error('❌ Error al subir imagen a Storage:', error);
      throw error;
    }
  }
}
