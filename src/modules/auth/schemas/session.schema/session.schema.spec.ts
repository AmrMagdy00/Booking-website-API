import { SessionSchema } from './session.schema';

describe('SessionSchema', () => {
  it('should be defined', () => {
    expect(new SessionSchema()).toBeDefined();
  });
});
