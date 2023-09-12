import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly title: string;

  @IsString()
  @ApiPropertyOptional()
  readonly description: string;

  //@IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly price: number;

  @ApiPropertyOptional()
  readonly thumbnail: string;

  @ApiProperty()
  readonly stock: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly author: string;

  @ApiPropertyOptional()
  readonly category: Category;
}
