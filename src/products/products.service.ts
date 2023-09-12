import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Product } from './entities/product.entity';
import mongoose from 'mongoose';
import { ProductNotFound } from './product.error';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: mongoose.Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.productModel.create(createProductDto);
  }

  async findAll(query: ExpressQuery): Promise<Product[]> {
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

    const products = await this.productModel
      .find({ ...keyword })
      .populate('book') // For both, use populate(['buyer', 'book'])
      .limit(resPerPage)
      .skip(skip);

    return products;
  }

  async findAllByUserId(
    userId: string,
    query: ExpressQuery,
  ): Promise<Product[]> {
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

    const products = await this.productModel
      .find({
        ...keyword,
        buyer: userId,
      })
      .populate('book') // For both, use populate(['buyer', 'book'])
      .limit(resPerPage)
      .skip(skip);

    return products;
  }

  async deleteAllByUserId(userId: string) {
    const products: Array<Product & { _id: string }> =
      await this.productModel.find({
        buyer: userId,
      });
    const productIds = products.map((product) => product._id);
    return await this.productModel.deleteMany({ _id: productIds });
  }

  async findOne(id: string) {
    const isValidId = mongoose.isValidObjectId(id);

    const order = await this.productModel.findById(id);

    if (!isValidId) {
      throw new BadRequestException('Invalid id');
    }

    if (!order) {
      throw new ProductNotFound();
    }

    return order;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
      runValidators: true,
    });
  }

  async remove(id: string) {
    return await this.productModel.findByIdAndDelete(id);
  }
}
