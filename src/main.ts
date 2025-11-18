import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Función principal que inicializa la aplicación NestJS
 * Configura CORS, validación global y el puerto del servidor
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true, // En producción, especificar los orígenes permitidos
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

  // Puerto por defecto 3001 para evitar conflicto con Next.js (puerto 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
}
bootstrap();
