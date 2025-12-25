import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserRole } from '../enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockAdmin = { id: 'admin1', email: 'admin@test.com', userName: 'admin', role: UserRole.ADMIN };
  const mockUser = { id: 'user1', email: 'user@test.com', userName: 'user1', role: UserRole.NORMAL_USER };

  const mockUserResponse = {
    id: 'user1',
    userName: 'testuser',
    email: 'user@test.com',
    role: UserRole.NORMAL_USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService) as any;
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      const mockResult = { items: [mockUserResponse], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll({ page: 1, limit: 10 }, mockAdmin as any);

      expect(result.data).toEqual(mockResult.items);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user details', async () => {
      service.findById.mockResolvedValue(mockUserResponse as any);

      const result = await controller.findById('user1', mockUser as any);

      expect(result.data).toEqual(mockUserResponse);
      expect(service.findById).toHaveBeenCalledWith('user1', mockUser);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = { userName: 'new', email: 'new@test.com', password: '123' };
      service.create.mockResolvedValue(mockUserResponse as any);

      const result = await controller.create(dto as any, mockAdmin as any);

      expect(result.data).toEqual(mockUserResponse);
      expect(service.create).toHaveBeenCalledWith(dto, mockAdmin);
    });
  });
});
