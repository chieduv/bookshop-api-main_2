import AuthStub from './auth.stubs';

export const AuthService = jest.fn().mockReturnValue({
  signIn: jest.fn().mockResolvedValue(AuthStub.tokenStub()),
  signUp: jest.fn().mockResolvedValue(AuthStub.tokenStub()),
});
