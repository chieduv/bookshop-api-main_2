import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
  ParseFilePipeBuilder,
  UseInterceptors,
  UploadedFiles,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import * as fs from 'fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { BookService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.input';
import { UpdateBookDto } from './dto/update-book.input';
import { AuthGuard } from '../auth/auth.guard';
import * as path from 'path';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';

const fileValidator = new ParseFilePipeBuilder().build({
  fileIsRequired: false,
});

const defaultStorage = diskStorage({
  destination: 'media',
  filename(_, file, callback) {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const thumbnailAndProductInterceptor = FileFieldsInterceptor(
  [
    { name: 'thumbnail', maxCount: 1 },
    { name: 'product', maxCount: 1 },
  ],
  {
    storage: defaultStorage,
    fileFilter(_, file, callback) {
      if (Boolean(file.mimetype.match(/(jpg|jpeg|png|gif|pdf|epub)/))) {
        callback(null, true);
      } else {
        const fieldErrorMap = {
          product: 'Invalid file type. Please enter a PDF file',
          thumbnail: 'Invalid file type. Please enter an image',
        };

        callback(
          new UnsupportedMediaTypeException(fieldErrorMap[file.fieldname]),
          false,
        );
      }
    },
  },
);

@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get()
  async getAllBooks(
    @Query()
    query?: ExpressQuery,
  ): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getBook(
    @Param('id')
    id: string,
  ): Promise<Book> {
    return this.bookService.findBookById(id);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(thumbnailAndProductInterceptor)
  @Post()
  async createBook(
    @Body() bookLessThumbnail: CreateBookDto,
    @UploadedFiles(fileValidator)
    files?: {
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const thumbnail = files?.thumbnail?.[0]?.filename;
    const newBook = this.bookService.create({
      ...bookLessThumbnail,
      thumbnail,
    });
    return newBook;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(thumbnailAndProductInterceptor)
  @Patch(':id')
  async updateBook(
    @Param('id')
    id: string,
    @Body()
    bookLessThumbnail: UpdateBookDto,
    @UploadedFiles(fileValidator)
    files?: {
      thumbnail?: Express.Multer.File[];
      product?: Express.Multer.File[];
    },
  ): Promise<Book> {
    const thumbnail = files.thumbnail?.[0]?.path;
    return this.bookService.updateBookById(id, {
      ...bookLessThumbnail,
      thumbnail,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteBook(
    @Param('id')
    id: string,
  ): Promise<Book> {
    const bookThumbnail = this.bookService.findBookById(id);

    if (bookThumbnail) {
      fs.unlink(`./${bookThumbnail}`, (err) => {
        console.log(err);
      });
    }

    return this.bookService.deleteBookById(id);
  }
}
