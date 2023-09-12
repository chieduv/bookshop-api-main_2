import mongoose from 'mongoose';
import { Product } from '../entities/product.entity';

export default class ProductStub {
  public static productStub = (): Product & { _id: string } => ({
    _id: new mongoose.Types.ObjectId().toString(),
    buyer: new mongoose.Types.ObjectId().toString(),
    book: new mongoose.Types.ObjectId().toString(),
    quantity: 2,
  });
}
