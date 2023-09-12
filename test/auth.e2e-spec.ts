import { ConfigModule } from '@nestjs/config';
// https://stackoverflow.com/a/71045457/6132438
// Moved here to fix a bug (env not being loaded early enough)
const envModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import AuthStub from '../src/auth/__mocks__/auth.stubs';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';

describe('UsersController', () => {
  let mongodb: MongoMemoryServer;
  let mongodbConnection: Connection;
  let app: INestApplication;
  let httpServer: any;
  let uri: string;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    uri = mongodb.getUri();
    mongodbConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        envModule,
        // https://www.gistshare.com/notes/137/nestjs-end-end-testing-memory-mongodb-example
        MongooseModule.forRoot(uri),
        AuthModule,
        UsersModule,
      ],
      providers: [AuthService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterEach(async () => {
    const collections = mongodbConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await app.close();
  });
  // return 401 for unauthorized resource access
  describe('Auth Tests', () => {
    it('should return 401 status code', async () => {
      const response = await request(httpServer).get('/auth/profile');
      expect(response.statusCode).toBe(401);
    });

    it('should return the currently authenticated user', async () => {
      const signUpDTOStub = AuthStub.signUpDTOStub();
      const signUpResponse = await request(httpServer)
        .post('/auth/signup')
        .send(signUpDTOStub);
      const { access_token } = signUpResponse.body;
      const response = await request(httpServer)
        .get('/auth/profile')
        .set('authorization', `Bearer ${access_token}`);
      expect(response.body.email).toEqual(signUpDTOStub.email);
    });
  });
});
