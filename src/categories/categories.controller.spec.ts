import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});
// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './entities/category.entity';
import constants from '../auth/constants';
import { AuthGuard } from '../auth/auth.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let categoryModel: Model<Category>;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    categoryModel = mongodbConnection.model(Category.name, CategorySchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        JwtModule.register({
          secret: constants.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: categoryModel },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
