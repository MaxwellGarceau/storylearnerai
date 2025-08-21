import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvironmentConfig } from '../../config/env';

// Mock the environment configuration
vi.mock('../../config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: vi.fn(),
    isDevelopment: vi.fn(),
    isProduction: vi.fn(),
  },
}));

describe('LLMServiceManager', () => {
  let LLMServiceManager: typeof import('../LLMServiceManager').LLMServiceManager;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock environment configuration
    vi.mocked(EnvironmentConfig.getLLMConfig).mockReturnValue({
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://generativelanguage.googleapis.com',
      model: 'gemini-pro',
      maxTokens: 2000,
      temperature: 0.7,
    });

    vi.mocked(EnvironmentConfig.isDevelopment).mockReturnValue(true);

    // Import the module fresh for each test
    const module = await import('../LLMServiceManager');
    LLMServiceManager = module.LLMServiceManager;
  });

  afterEach(() => {
    // Reset singleton instance safely
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (LLMServiceManager as any as { instance: undefined }).instance =
        undefined;
    } catch {
      // Ignore errors during cleanup
    }
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = LLMServiceManager.getInstance();
      const instance2 = LLMServiceManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should initialize with environment configuration', () => {
      const manager = LLMServiceManager.getInstance();

      expect(EnvironmentConfig.getLLMConfig).toHaveBeenCalled();
      expect(manager.getProvider()).toBe('gemini');
      expect(manager.getModel()).toBe('gemini-pro');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const manager = LLMServiceManager.getInstance();
      const providers = manager.getAvailableProviders();

      expect(providers).toContain('gemini');
      expect(providers).toEqual(['gemini']);
    });
  });

  describe('getProviderDisplayNames', () => {
    it('should return display names for providers', () => {
      const manager = LLMServiceManager.getInstance();
      const displayNames = manager.getProviderDisplayNames();

      expect(displayNames['gemini']).toBe('Google Gemini');
      expect(Object.keys(displayNames)).toEqual(['gemini']);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the current configuration', () => {
      const manager = LLMServiceManager.getInstance();
      const config = manager.getConfig();

      expect(config.provider).toBe('gemini');
      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gemini-pro');

      // Should be a copy, not the original
      config.apiKey = 'modified';
      expect(manager.getConfig().apiKey).toBe('test-api-key');
    });
  });

  describe('reinitialize', () => {
    // Disabled: Anthropic reinitialize test - only Gemini is actively used
    it.skip('should reinitialize with new configuration', () => {
      const manager = LLMServiceManager.getInstance();

      const newConfig = {
        provider: 'anthropic' as const,
        apiKey: 'new-api-key',
        endpoint: 'https://api.anthropic.com/v1',
        model: 'claude-3-haiku-20240307',
        maxTokens: 1000,
        temperature: 0.5,
        version: '2023-06-01',
      };

      manager.reinitialize(newConfig);

      expect(manager.getProvider()).toBe('anthropic');
      expect(manager.getModel()).toBe('claude-3-haiku-20240307');
    });
  });
});
