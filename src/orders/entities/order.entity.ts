import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum Status {
  PENDING = 'pending',
  DELIVERED = 'delivered',
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: User.name,
  })
  buyer: User;

  @Prop()
  products: Product[];

  @Prop({
    default: Status.PENDING,
  })
  status: Status;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
