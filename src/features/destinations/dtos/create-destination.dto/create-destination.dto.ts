import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ImageDto } from '@/shared/dtos/image.dto';
import { Type } from 'class-transformer';
export class CreateDestinationDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 30)
  governoratName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  description: string;

  // @IsArray()
  // @IsString()
  // @ValidateNested({ each: true })
  // @Type(() => ImageDto)
  // @ArrayMinSize(1)
  // images:string[]
}
