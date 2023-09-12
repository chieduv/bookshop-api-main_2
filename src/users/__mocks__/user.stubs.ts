import { User } from '../entities/user.entity';

export default class UserStub {
  public static userStub = (): User => ({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@gmail.com',
    passwordHash:
      '$2b$10$8wplrWOfB6USn6JpR/L2COFuzfEFTlX1KI1gM1TllO19DQg5yctne',
  });
}
