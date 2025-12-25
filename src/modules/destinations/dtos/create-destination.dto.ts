import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;
}
