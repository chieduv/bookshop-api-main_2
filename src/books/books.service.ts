import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Book } from './entities/book.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: mongoose.Model<Book>,
  ) {}

  async findAll(query: ExpressQuery): Promise<Book[]> {
    const resPerPage =
      Number(query?.limit) ?? Number(process.env.PAGINATION_LIMIT);
    const currentPage = Number(query.page) ?? 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const books = await this.bookModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
    return books;
  }

  async findBookById(id: string): Promise<Book> {
    const isValidId = mongoose.isValidObjectId(id);

    const book = await this.bookModel.findById(id);

    if (!isValidId) {
      throw new BadRequestException('Invalid id');
    }

    if (!book) {
      throw new NotFoundException('Book Not Found');
    }

    return book;
  }

  async create(book: Book): Promise<Book> {
    return await this.bookModel.create(book);
  }

  async updateBookById(id: string, book: Book): Promise<Book> {
    return await this.bookModel.findByIdAndUpdate(id, book, {
      new: true,
      runValidators: true,
    });
  }

  async deleteBookById(id: string): Promise<Book> {
    return await this.bookModel.findByIdAndDelete(id);
  }
}
