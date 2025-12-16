import { AuthStrategyFactory } from './auth-strategy.factory';

describe('AuthStrategyFactory', () => {
  it('should be defined', () => {
    expect(new AuthStrategyFactory()).toBeDefined();
  });
});
