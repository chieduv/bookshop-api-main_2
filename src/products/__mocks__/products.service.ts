import ProductStub from './products.stubs';

export const ProductsService = jest.fn().mockReturnValue({
  findAllByUserId: jest.fn().mockResolvedValue([ProductStub.productStub()]),
  findOne: jest.fn().mockResolvedValue(ProductStub.productStub()),
  findAll: jest.fn().mockResolvedValue([ProductStub.productStub()]),
  create: jest.fn().mockResolvedValue(ProductStub.productStub()),
});
