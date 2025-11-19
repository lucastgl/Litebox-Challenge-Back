import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

/**
 * Módulo de Firebase
 * Proporciona el servicio de Firebase de forma global para toda la aplicación
 * Inicializa el SDK de Firebase Admin al arrancar la aplicación
 */
@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}

