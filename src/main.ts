import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';

/**
 * Función principal que inicializa la aplicación NestJS
 * Configura CORS, validación global y el puerto del servidor
 * 
 * Configuración de puertos:
 * - Desarrollo: NestJS en http://localhost:3001
 * - Producción: NestJS en Railway (puerto asignado automáticamente)
 * 
 * Base de datos:
 * - Utiliza Firebase Firestore para almacenar posts relacionados
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar el límite del body parser para permitir imágenes en base64
  // 50MB debería ser suficiente para imágenes grandes en base64
  app.use(json({ limit: '50mb' }));

  // Configurar CORS desde variables de entorno
  // ALLOWED_ORIGINS puede contener múltiples orígenes separados por comas
  // Ejemplo en desarrollo: ALLOWED_ORIGINS=http://localhost:3000
  // Ejemplo en producción: ALLOWED_ORIGINS=https://mi-front.vercel.app
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Habilitar validación global para todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar automáticamente los tipos
      transformOptions: {
        enableImplicitConversion: true, // Permitir conversión implícita de tipos
      },
    }),
  );

  // Configurar el prefijo global para todas las rutas (opcional)
  // app.setGlobalPrefix('api');

  // Puerto desde variable de entorno (requisito para Railway)
  // En desarrollo: 3001 para evitar conflicto con Next.js (puerto 3000)
  // En producción: Railway asigna el puerto automáticamente
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`🔥 Firebase Firestore configurado para posts relacionados`);
}
bootstrap();
