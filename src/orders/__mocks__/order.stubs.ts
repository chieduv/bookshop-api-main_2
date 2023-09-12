import mongoose from 'mongoose';
import { Order, Status } from '../entities/order.entity';

export const createOrderDTOStub = (): Order & {
  _id: string;
} => ({
  _id: new mongoose.Types.ObjectId().toString(),
  buyer: null,
  products: [],
  status: Status.PENDING,
});
