import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import constants from '../auth/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule } from '@nestjs/jwt';
import { Model, connect } from 'mongoose';
import { Connection } from 'mongoose';
import { AuthGuard } from '../auth/auth.guard';

describe('ProductsController', () => {
  let controller: ProductsController;

  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let bookModel: Model<Product>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    bookModel = mongodbConnection.model(Product.name, ProductSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        JwtModule.register({
          secret: constants.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: bookModel,
        },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
