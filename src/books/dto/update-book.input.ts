import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly description: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly thumbnail: string;

  @IsOptional()
  // @IsNumber()
  @ApiPropertyOptional()
  readonly price: number;

  @IsOptional()
  // @IsNumber()
  @ApiPropertyOptional()
  readonly stock: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly author: string;

  @IsOptional()
  @ApiPropertyOptional()
  readonly category: Category;
}
