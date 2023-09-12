import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderAlreadyExists extends HttpException {
  constructor() {
    super('Duplicate order ID', HttpStatus.BAD_REQUEST);
  }
}

export class OrderNotFound extends HttpException {
  constructor() {
    super('Order not found', HttpStatus.BAD_REQUEST);
  }
}
