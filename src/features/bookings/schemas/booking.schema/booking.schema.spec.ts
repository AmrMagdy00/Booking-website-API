import { BookingSchema } from './booking.schema';

describe('BookingSchema', () => {
  it('should be defined', () => {
    expect(new BookingSchema()).toBeDefined();
  });
});
