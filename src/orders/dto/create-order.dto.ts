import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { Status } from '../entities/order.entity';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly buyer: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly products: Product[];

  @ApiPropertyOptional()
  readonly status?: Status;
}
