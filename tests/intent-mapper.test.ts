import { IntentMapper } from '../src/intent-mapper';

describe('IntentMapper', () => {
  let intentMapper: IntentMapper;

  beforeEach(() => {
    intentMapper = new IntentMapper();
  });

  describe('mapQueryToIntent', () => {
    it('should map a mobility query correctly', async () => {
      const query = 'Book me a cab from MG Road to the airport';
      const context = {};

      const result = await intentMapper.mapQueryToIntent(query, context);

      expect(result).toBeDefined();
      expect(result?.domain).toBe('mobility');
      expect(result?.operation).toBe('search');
      expect(result?.parameters.origin).toBe('mg road');
      expect(result?.parameters.destination).toBe('the airport');
    });

    it('should map a retail query correctly', async () => {
      const query = 'I want to buy an iPhone 15';
      const context = {};

      const result = await intentMapper.mapQueryToIntent(query, context);

      expect(result).toBeDefined();
      expect(result?.domain).toBe('retail');
      expect(result?.operation).toBe('search');
      expect(result?.parameters.product).toBe('an iphone 15');
      expect(result?.parameters.delivery).toBe(false);
    });

    it('should map a food query correctly', async () => {
      const query = 'Order a pizza from Dominos';
      const context = {};

      const result = await intentMapper.mapQueryToIntent(query, context);

      expect(result).toBeDefined();
      expect(result?.domain).toBe('food');
      expect(result?.operation).toBe('search');
      expect(result?.parameters.restaurant).toBe('dominos');
      expect(result?.parameters.food).toBe('a pizza');
      expect(result?.parameters.delivery).toBe(true);
    });

    it('should return null for unsupported domains', async () => {
      const query = 'What is the weather like today?';
      const context = {};

      const result = await intentMapper.mapQueryToIntent(query, context);

      expect(result).toBeNull();
    });
  });
});
