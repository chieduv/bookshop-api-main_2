import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTypes } from 'mongoose';
import { Book } from '../../books/entities/book.entity';
import { User } from '../../users/entities/user.entity';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Book.name,
  })
  book: Book | string;

  @Prop()
  quantity: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  buyer: User | string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
