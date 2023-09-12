import mongoose from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryNotFound } from './categories.error';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: mongoose.Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryModel.create(createCategoryDto);
  }

  async findAll(query: ExpressQuery): Promise<Category[]> {
    const resPerPage = 2;
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

    const categories = await this.categoryModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);

    return categories;
  }

  async findOne(id: string) {
    const isValidId = mongoose.isValidObjectId(id);

    const category = await this.categoryModel.findById(id);

    if (!isValidId) {
      throw new BadRequestException('Invalid id');
    }

    if (!category) {
      throw new CategoryNotFound();
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {
      new: true,
      runValidators: true,
    });
  }

  async remove(id: string) {
    return await this.categoryModel.findByIdAndDelete(id);
  }
}
