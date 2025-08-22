import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env
const mockEnv = {
  VITE_DISABLE_DICTIONARY: 'false',
  VITE_DICTIONARY_API_ENDPOINT: 'https://test-api.com',
  VITE_DICTIONARY_API_KEY: 'test-key',
  VITE_ENABLE_MOCK_TRANSLATION: 'false',
  MODE: 'development',
};

vi.mock('import.meta', () => ({
  env: mockEnv,
}));

// Import after mocking
import { EnvironmentConfig } from '../env';

describe('EnvironmentConfig', () => {
  beforeEach(() => {
    // Reset mock environment
    mockEnv.VITE_DISABLE_DICTIONARY = 'false';
    mockEnv.VITE_DICTIONARY_API_ENDPOINT = 'https://test-api.com';
    mockEnv.VITE_DICTIONARY_API_KEY = 'test-key';
    mockEnv.VITE_ENABLE_MOCK_TRANSLATION = 'false';
    mockEnv.MODE = 'development';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isDictionaryDisabled', () => {
    it('should return false when VITE_DISABLE_DICTIONARY is not set', () => {
      delete mockEnv.VITE_DISABLE_DICTIONARY;
      expect(EnvironmentConfig.isDictionaryDisabled()).toBe(false);
    });

    it('should return false when VITE_DISABLE_DICTIONARY is "false"', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'false';
      expect(EnvironmentConfig.isDictionaryDisabled()).toBe(false);
    });

    it('should return true when VITE_DISABLE_DICTIONARY is "true"', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'true';
      expect(EnvironmentConfig.isDictionaryDisabled()).toBe(true);
    });

    it('should return false for other values', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'maybe';
      expect(EnvironmentConfig.isDictionaryDisabled()).toBe(false);
    });
  });

  describe('getDictionaryConfig', () => {
    it('should return empty config when dictionary is disabled', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'true';
      const config = EnvironmentConfig.getDictionaryConfig();
      expect(config).toEqual({
        endpoint: '',
        apiKey: '',
      });
    });

    it('should return actual config when dictionary is enabled', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'false';
      const config = EnvironmentConfig.getDictionaryConfig();
      expect(config).toEqual({
        endpoint: 'https://test-api.com',
        apiKey: 'test-key',
      });
    });

    it('should throw error when endpoint is missing and dictionary is enabled', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'false';
      delete mockEnv.VITE_DICTIONARY_API_ENDPOINT;
      
      expect(() => EnvironmentConfig.getDictionaryConfig()).toThrow(
        'VITE_DICTIONARY_API_ENDPOINT environment variable is required'
      );
    });

    it('should throw error when API key is missing and dictionary is enabled', () => {
      mockEnv.VITE_DISABLE_DICTIONARY = 'false';
      delete mockEnv.VITE_DICTIONARY_API_KEY;
      
      expect(() => EnvironmentConfig.getDictionaryConfig()).toThrow(
        'VITE_DICTIONARY_API_KEY environment variable is required'
      );
    });
  });
});
