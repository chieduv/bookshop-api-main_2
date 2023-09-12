import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.input';
import { CreateUserDto } from './dto/create-user.input';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

const fileValidator = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /(jpg|jpeg|png|gif|pdf|epub)/,
  })
  .build({
    fileIsRequired: false,
  });

const avatarStorage = diskStorage({
  destination: 'media/avatars',
  filename(_, file, callback) {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const avatarInterceptor = FileInterceptor('avatar', {
  storage: avatarStorage,
});

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async getAllUsers(
    @Query()
    query?: ExpressQuery,
  ): Promise<User[]> {
    return this.userService.findAll(query);
  }

  @Get(':email')
  async getUserByEmail(email: string): Promise<User> {
    return this.userService.findUserByEmail(email);
  }

  @Get(':id')
  async getUser(id: string): Promise<User> {
    return this.userService.findUserById(id);
  }

  @Post()
  async createUser(
    @Body()
    user: CreateUserDto,
  ): Promise<User> {
    return this.userService.create(user);
  }

  @UseInterceptors(avatarInterceptor)
  @Patch(':id')
  async updateUser(
    @Param('id')
    id: string,
    @Body()
    user: UpdateUserDto,
    @UploadedFile(fileValidator)
    file?: Express.Multer.File,
  ): Promise<User> {
    return this.userService.updateUserById(id, { ...user, avatar: file.path });
  }

  @Delete(':id')
  async deleteUser(
    @Param('id')
    id: string,
  ): Promise<User> {
    return this.userService.deleteuserById(id);
  }
}
