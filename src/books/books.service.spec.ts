import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BookService } from './books.service';
import { Book, BookSchema } from './entities/book.entity';
import { AuthGuard } from '../auth/auth.guard';

describe('BookService', () => {
  let service: BookService;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let bookModel: Model<Book>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    bookModel = mongodbConnection.model(Book.name, BookSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: getModelToken(Book.name), useValue: bookModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
