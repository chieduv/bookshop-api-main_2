import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './books.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Book, BookSchema } from './entities/book.entity';
import constants from '../auth/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule } from '@nestjs/jwt';
import { Model, connect } from 'mongoose';
import { Connection } from 'mongoose';
import { BookService } from './books.service';
import { AuthGuard } from '../auth/auth.guard';

describe('BookController', () => {
  let controller: BookController;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let bookModel: Model<Book>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    bookModel = mongodbConnection.model(Book.name, BookSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        JwtModule.register({
          secret: constants.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [BookController],
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: bookModel,
        },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
  });

  afterEach(async () => {
    const collections = mongodbConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongodbConnection.dropDatabase();
    await mongodbConnection.close();
    await mongodb.stop();
  });

  describe('Book', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
