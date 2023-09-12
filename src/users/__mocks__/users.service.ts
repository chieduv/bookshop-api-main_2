import UserStub from './user.stubs';

export const UsersService = jest.fn().mockReturnValue({
  findUserById: jest.fn().mockResolvedValue(UserStub.userStub()),
  findUserByEmail: jest.fn().mockResolvedValue(UserStub.userStub()),
  findAll: jest.fn().mockResolvedValue([UserStub.userStub()]),
  create: jest.fn().mockResolvedValue(UserStub.userStub()),
});
