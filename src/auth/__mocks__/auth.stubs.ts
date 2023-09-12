import { User } from '../../users/entities/user.entity';
import { SignUpDto } from '../dto/signup.input';
import { SignInDto } from '../dto/signin.input';

export default class AuthStub {
  public static tokenStub = (): string =>
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmVkb2VAZ21haWwuY29tIiwiaWF0IjoxNjg5NDM4NDA3LCJleHAiOjE2ODk1MjQ4MDd9.MsWJm2d61O26GYkHTtZVWdl4WoS--TTofuhpUS7qhs4';

  public static profileStub = (): User => ({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@gmail.com',
    passwordHash:
      '$2b$10$8wplrWOfB6USn6JpR/L2COFuzfEFTlX1KI1gM1TllO19DQg5yctne',
  });

  public static signUpDTOStub = (): SignUpDto => ({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@gmail.com',
    password: '$Letslove',
    passwordConfirm: '$Letslove',
  });

  public static signInDTOStub = (): SignInDto => ({
    email: 'janedoe@gmail.com',
    password: '$Letslove',
  });
}
