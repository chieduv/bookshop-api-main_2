import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.input';
import { AuthGuard } from './auth.guard';
import { SignUpDto } from './dto/signup.input';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  /**
   * Usage: $ curl -X POST http://localhost:3000/auth/signin -d '{"email": "john@gmail.com", "password": "changeme"}' -H "Content-Type: application/json"
   */
  signIn(@Body() { email, password }: SignInDto) {
    return this.authService.signIn(email, password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  /**
   * Usage: $ curl -X POST http://localhost:3000/auth/signup -d '{"email": "john@gmail.com", "password": "changeme", "firstName": "John", "lastName": "Smith"}' -H "Content-Type: application/json"
   */
  signUp(@Body() credentials: SignUpDto) {
    return this.authService.signUp(credentials);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  /**
   * Usage: $ curl http://localhost:3000/auth/profile
   */
  getProfile(@Request() req) {
    return this.usersService.findUserByEmail(req.user?.email);
  }
}
