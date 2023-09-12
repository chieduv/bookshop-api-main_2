import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductAlreadyExists extends HttpException {
  constructor() {
    super('Duplicate product ID', HttpStatus.BAD_REQUEST);
  }
}

export class ProductNotFound extends HttpException {
  constructor() {
    super('Product not found', HttpStatus.BAD_REQUEST);
  }
}
