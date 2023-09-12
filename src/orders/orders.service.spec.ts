import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './entities/order.entity';
import { AuthGuard } from '../auth/auth.guard';
import constants from '../auth/constants';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { User, UserSchema } from '../users/entities/user.entity';
import { Book, BookSchema } from '../books/entities/book.entity';
import { Product, ProductSchema } from '../products/entities/product.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let orderModel: Model<Order>;
  let userModel: Model<User>;
  let bookModel: Model<Book>;
  let productModel: Model<Product>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    orderModel = mongodbConnection.model(Order.name, OrderSchema);
    userModel = mongodbConnection.model(User.name, UserSchema);
    bookModel = mongodbConnection.model(Book.name, BookSchema);
    productModel = mongodbConnection.model(Product.name, ProductSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        JwtModule.register({
          secret: constants.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        UsersService,
        OrdersService,
        ProductsService,
        { provide: getModelToken(Book.name), useValue: bookModel },
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
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

  describe('Auth Tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
