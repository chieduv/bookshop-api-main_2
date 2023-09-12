import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import mongoose from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { OrderNotFound } from './order.error';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: mongoose.Model<Order>,
    private productService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderModel.create(createOrderDto);
    await this.productService.deleteAllByUserId(createOrderDto.buyer);
    return order;
  }

  async findAll(query: ExpressQuery): Promise<Order[]> {
    const resPerPage =
      Number(query?.limit) ?? Number(process.env.PAGINATION_LIMIT);
    const currentPage = Number(query?.page) ?? 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query?.keyword
      ? {
          orderId: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const orders = await this.orderModel
      .find({ ...keyword })
      .populate('buyer')
      .limit(resPerPage)
      .skip(skip);

    return orders;
  }

  async findAllByUserId(userId: string, query: ExpressQuery): Promise<Order[]> {
    const resPerPage =
      Number(query?.limit) ?? Number(process.env.PAGINATION_LIMIT);
    const currentPage = Number(query?.page) ?? 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query?.keyword
      ? {
          orderId: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const orders = await this.orderModel
      .find({ ...keyword, buyer: userId })
      .populate('buyer')
      .limit(resPerPage)
      .skip(skip);

    return orders;
  }

  async findOne(id: string) {
    const isValidId = mongoose.isValidObjectId(id);

    const order = await this.orderModel.findById(id);

    if (!isValidId) {
      throw new BadRequestException('Invalid id');
    }

    if (!order) {
      throw new OrderNotFound();
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true,
      runValidators: true,
    });
  }

  async remove(id: string) {
    return await this.orderModel.findByIdAndDelete(id);
  }
}
