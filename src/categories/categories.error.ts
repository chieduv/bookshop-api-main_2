import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryAlreadyExists extends HttpException {
  constructor() {
    super('Duplicate category ID', HttpStatus.BAD_REQUEST);
  }
}

export class CategoryNotFound extends HttpException {
  constructor() {
    super('Category not found', HttpStatus.BAD_REQUEST);
  }
}
