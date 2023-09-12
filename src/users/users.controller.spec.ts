import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

// https://betterprogramming.pub/testing-controllers-in-nestjs-and-mongo-with-jest-63e1b208503c

import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './entities/user.entity';
import { Connection, Model, connect } from 'mongoose';
import AuthStub from '../auth/__mocks__/auth.stubs';
import { JwtModule } from '@nestjs/jwt';
import constants from '../auth/constants';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';

// jest.mock('./users.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let authController: AuthController;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let userModel: Model<User>;

  /**
   * Spin up test DB, and set up test module
   */
  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    userModel = mongodbConnection.model(User.name, UserSchema);

    const authModule: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        JwtModule.register({
          secret: constants.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    authController = authModule.get<AuthController>(AuthController);
    // jest.clearAllMocks();
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

  afterAll(async () => {
    await mongodbConnection.dropDatabase();
    await mongodbConnection.close();
    await mongodb.stop();
  });

  describe('User controller tests', () => {
    it('Feth User by email', async () => {
      const stub = AuthStub.signUpDTOStub();
      await authController.signUp(stub);
      const fetchedUser = await usersController.getUserByEmail(stub.email);
      expect(fetchedUser.email).toBe(stub.email);
    });

    it('returns the correct number of saved users', async () => {
      const stub = AuthStub.signUpDTOStub();
      await authController.signUp(stub);
      await authController.signUp({ ...stub, email: 'johndoe@gmail.com' });
      const fetchedUsers = await usersController.getAllUsers();
      expect(fetchedUsers.length).toBe(2);
    });

    it('fetch user by ID', async () => {
      const stub = AuthStub.signUpDTOStub();
      await authController.signUp(stub);
      const fetchedByEmail: User & { _id?: string } =
        await usersController.getUserByEmail(stub.email);
      const fetchedById = await usersController.getUser(fetchedByEmail._id);
      expect(fetchedByEmail.firstName).toBe(fetchedById.firstName);
    });
  });
});
