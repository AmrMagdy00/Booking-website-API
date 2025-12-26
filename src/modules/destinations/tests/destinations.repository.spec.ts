import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DestinationsRepository } from '@/modules/destinations/destinations.repository';
import { Destination } from '@/modules/destinations/schema/destination.schema';
import { Types } from 'mongoose';

describe('DestinationsRepository', () => {
  let repository: DestinationsRepository;
  let model: any;

  const mockDestination = {
    _id: new Types.ObjectId(),
    name: 'Paris',
    save: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationsRepository,
        {
          provide: getModelToken(Destination.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockDestination),
            constructor: jest.fn().mockResolvedValue(mockDestination),
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

    repository = module.get<DestinationsRepository>(DestinationsRepository);
    model = module.get(getModelToken(Destination.name));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call model findById', async () => {
      const spy = jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDestination),
      } as any);

      await repository.findById(mockDestination._id.toString());
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call model create', async () => {
      const spy = jest
        .spyOn(model, 'create')
        .mockResolvedValue(mockDestination as any);
      await repository.create({ name: 'Paris' } as any);
      expect(spy).toHaveBeenCalled();
    });
  });
});
