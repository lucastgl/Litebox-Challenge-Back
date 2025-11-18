import { IsString, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';

/**
 * DTO para crear un nuevo post relacionado
 * Valida que se proporcione un título y una imagen válida
 */
export class CreateRelatedPostDto {
  /**
   * Título del post relacionado
   * Debe ser una cadena no vacía
   */
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  /**
   * URL de la imagen del post relacionado
   * Debe ser una URL válida si se proporciona
   */
  @IsString()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsNotEmpty({ message: 'La imagen es requerida' })
  image: string;
}

