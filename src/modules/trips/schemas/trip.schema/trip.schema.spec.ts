import { TripSchema } from './trip.schema';

describe('TripSchema', () => {
  it('should be defined', () => {
    expect(new TripSchema()).toBeDefined();
  });
});
