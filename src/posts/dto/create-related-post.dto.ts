import { IsString, IsNotEmpty, Matches } from 'class-validator';

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
   * URL de la imagen del post relacionado o data URL (base64)
   * Acepta URLs HTTP/HTTPS o data URLs (data:image/...)
   */
  @IsString()
  @IsNotEmpty({ message: 'La imagen es requerida' })
  @Matches(
    /^(https?:\/\/.+|data:image\/(jpeg|jpg|png);base64,.+)$/,
    {
      message: 'La imagen debe ser una URL válida o una data URL (base64)',
    },
  )
  image: string;
}

