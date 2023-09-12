import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { User } from './entities/user.entity';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findAll(query?: ExpressQuery): Promise<User[]> {
    const resPerPage =
      Number(query?.limit) ?? Number(process.env.PAGINATION_LIMIT);
    const currentPage = Number(query?.page) ?? 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query?.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const users = await this.userModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
    return users;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('user Not Found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.find({ email });

    if (!user) {
      throw new NotFoundException('user Not Found');
    }

    return user[0];
  }

  async create(user: User): Promise<User> {
    const res = await this.userModel.create(user);
    return res;
  }

  async updateUserById(id: string, user: User): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, user, {
      new: true,
      runValidators: true,
    });
  }

  async deleteuserById(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id);
  }
}
