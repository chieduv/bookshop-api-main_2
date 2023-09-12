import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import constants from './constants';
import { User, UserSchema } from '../users/entities/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import AuthStub from './__mocks__/auth.stubs';
import { UserAlreadyExistsException } from './auth.error';

// jest.mock('../users/users.service');
// jest.mock('./auth.service');

describe('UsersController', () => {
  let authController: AuthController;
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let userModel: Model<User>;
  const jwtService = new JwtService({
    secretOrPrivateKey: constants.jwtSecret,
  });

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;
    userModel = mongodbConnection.model(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
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

    authController = module.get<AuthController>(AuthController);
    // jest.clearAllMocks();
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
    it('Sign In', async () => {
      const user = AuthStub.signUpDTOStub();
      const { access_token } = await authController.signUp(user);

      expect(access_token).toBeDefined();

      const payload = await jwtService.verifyAsync(access_token, {
        secret: constants.jwtSecret,
      });

      expect(payload.email).toBe(user.email);
    });

    it('should return UserAlreadyExists (Bad Request - 400) exception', async () => {
      const signUpDTOStub = AuthStub.signUpDTOStub();
      await authController.signUp(signUpDTOStub);
      await expect(authController.signUp(signUpDTOStub)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });
});
