import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService) as any;
  });

  describe('register', () => {
    it('should return registered user and token', async () => {
      const mockResult = { user: { email: 't@t.com' }, token: 'tk' };
      service.register.mockResolvedValue(mockResult as any);

      const result = await controller.register({ email: 't@t.com' } as any);

      expect(result.data).toEqual(mockResult);
      expect(result.message).toContain('registered');
    });
  });

  describe('login', () => {
    it('should return user and token on login', async () => {
      const mockResult = { user: { email: 't@t.com' }, token: 'tk' };
      service.login.mockResolvedValue(mockResult as any);

      const result = await controller.login({ email: 't@t.com', password: '123' });

      expect(result.data).toEqual(mockResult);
      expect(result.message).toContain('successful');
    });
  });
});
