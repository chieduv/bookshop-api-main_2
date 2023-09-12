import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Product, ProductSchema } from './entities/product.entity';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '../auth/auth.guard';

describe('ProductsService', () => {
  let service: ProductsService;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let productModel: Model<Product>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    productModel = mongodbConnection.model(Product.name, ProductSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
