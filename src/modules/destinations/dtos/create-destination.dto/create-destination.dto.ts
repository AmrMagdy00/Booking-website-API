import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

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
}
