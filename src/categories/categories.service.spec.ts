import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './entities/category.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '../auth/auth.guard';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let categoryModel: Model<Category>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    categoryModel = mongodbConnection.model(Category.name, CategorySchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: categoryModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
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
    expect(service).toBeDefined();
  });
});
