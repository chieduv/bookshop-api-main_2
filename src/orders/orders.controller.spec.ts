import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c
import { Test, TestingModule } from '@nestjs/testing';
import * as mocks from 'node-mocks-http';
import { JwtModule } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderNotFound } from './order.error';
import { createOrderDTOStub } from './__mocks__/order.stubs';
import constants from '../auth/constants';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { User, UserSchema } from '../users/entities/user.entity';
import { Book, BookSchema } from '../books/entities/book.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Product, ProductSchema } from '../products/entities/product.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
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

    userModel = mongodbConnection.model(User.name, UserSchema);
    orderModel = mongodbConnection.model(Order.name, OrderSchema);
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
      controllers: [OrdersController],
      providers: [
        UsersService,
        ProductsService,
        OrdersService,
        { provide: getModelToken(Book.name), useValue: bookModel },
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterAll(async () => {
    await mongodbConnection.dropDatabase();
    await mongodbConnection.close();
    await mongodb.stop();
  });

  /**
   * Clear persisted data
   */
  afterEach(async () => {
    const collections = mongodbConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Order Controller Unit Tests', () => {
    /**
     * Create
     */
    it('should return new order', async () => {
      const dtoStub = createOrderDTOStub();
      const newOrder = await orderModel.create(dtoStub);
      expect(newOrder._id.toString()).toBe(dtoStub._id);
    });

    /**
     * 404
     */
    it('should throw should return OrderNotFound (Bad Request - 400) when the order does not exist', async () => {
      const order = controller.findOne(createOrderDTOStub()._id);
      await expect(order).rejects.toThrow(OrderNotFound);
    });

    /**
     * Find One
     */
    it('should return the corresponding saved object', async () => {
      const stub = createOrderDTOStub();
      const newOrder = await new orderModel(stub).save();
      const order = await controller.findOne(stub._id);
      expect(order._id.toString()).toBe(newOrder._id.toString());
    });

    /**
     * Find All
     */
    it('should return same number of inserted objects', async () => {
      await new orderModel(createOrderDTOStub()).save();
      await new orderModel(createOrderDTOStub()).save();
      const req = mocks.createRequest();
      req.user = {
        isAmin: true,
      };
      const orders = await controller.findAll(req);
      expect(orders.length).toBe(2);
    });

    /**
     * Delete
     */
    it('should return correct number of objects after a delete', async () => {
      // Create two
      const targetOrder = await new orderModel(createOrderDTOStub()).save();
      await new orderModel(createOrderDTOStub()).save();

      // Delete one
      await orderModel.findByIdAndDelete(targetOrder._id);
      const req = mocks.createRequest();
      req.user = {
        isAdmin: true,
      };
      const orders = await controller.findAll(req);
      expect(orders.length).toBe(1);
    });
  });
});
