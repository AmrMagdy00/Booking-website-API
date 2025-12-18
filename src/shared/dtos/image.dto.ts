import { IsString, IsNotEmpty } from 'class-validator';

export class ImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  publicId: string;
}
