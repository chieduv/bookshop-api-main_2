import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
// https://jestjs.io/docs/manual-mocks

jest.mock('./users.service');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
