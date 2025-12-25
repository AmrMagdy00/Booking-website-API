import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from '../users.repository';
import { User } from '../schema/user.schema';
import { Types } from 'mongoose';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let model: any;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@test.com',
    save: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            countDocuments: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    model = module.get(getModelToken(User.name));
  });

  describe('findByEmail', () => {
    it('should call findOne with email', async () => {
      const spy = jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await repository.findByEmail('test@test.com');
      expect(spy).toHaveBeenCalledWith({ email: 'test@test.com' });
    });
  });

  describe('create', () => {
    it('should call model create', async () => {
      const spy = jest.spyOn(model, 'create').mockResolvedValue(mockUser as any);
      await repository.create({ email: 'test@test.com' } as any);
      expect(spy).toHaveBeenCalled();
    });
  });
});
