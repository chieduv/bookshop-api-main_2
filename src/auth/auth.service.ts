import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/signup.input';
import constants from './constants';
import { User } from '../users/entities/user.entity';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from './auth.error';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user: User & { _id?: string } =
      await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const passwordHash = await bcrypt.hash(password, constants.saltRounds);
    const passwordDoesntMatch = !bcrypt.compare(
      passwordHash,
      user.passwordHash,
    );

    if (passwordDoesntMatch) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, _id: user._id, isAdmin: user.isAdmin };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(credentials: SignUpDto): Promise<any> {
    if (credentials?.password !== credentials.passwordConfirm) {
      throw new BadRequestException(
        'password and passwordConfirm do not match',
      );
    }

    if (await this.usersService.findUserByEmail(credentials.email)) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await bcrypt.hash(
      credentials.password,
      constants.saltRounds,
    );

    const user: Partial<User> & { _id?: string } =
      await this.usersService.create({
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        email: credentials.email,
        passwordHash: passwordHash,
      } as User);

    const payload: Partial<User> & { _id?: string } = {
      email: user.email,
      _id: user._id,
      isAdmin: user.isAdmin,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
