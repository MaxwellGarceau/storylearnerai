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
      provider: 'openai',
      apiKey: 'test-api-key',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      maxTokens: 2000,
      temperature: 0.7,
    });
    
    vi.mocked(EnvironmentConfig.isDevelopment).mockReturnValue(true);
    
    // Clear module cache and re-import
    vi.resetModules();
    const module = await import('../LLMServiceManager');
    LLMServiceManager = module.LLMServiceManager;
  });

  afterEach(() => {
    // Reset singleton instance
    (LLMServiceManager as any).instance = undefined;
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
      expect(manager.getProvider()).toBe('openai');
      expect(manager.getModel()).toBe('gpt-4o-mini');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const manager = LLMServiceManager.getInstance();
      const providers = manager.getAvailableProviders();
      
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('google');
      expect(providers).toContain('custom');
    });
  });

  describe('getProviderDisplayNames', () => {
    it('should return display names for providers', () => {
      const manager = LLMServiceManager.getInstance();
      const displayNames = manager.getProviderDisplayNames();
      
      expect(displayNames['openai']).toBe('OpenAI GPT');
      expect(displayNames['anthropic']).toBe('Anthropic Claude');
      expect(displayNames['google']).toBe('Google Gemini');
      expect(displayNames['custom']).toBe('Custom API');
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the current configuration', () => {
      const manager = LLMServiceManager.getInstance();
      const config = manager.getConfig();
      
      expect(config.provider).toBe('openai');
      expect(config.apiKey).toBe('test-api-key');
      expect(config.model).toBe('gpt-4o-mini');
      
      // Should be a copy, not the original
      config.apiKey = 'modified';
      expect(manager.getConfig().apiKey).toBe('test-api-key');
    });
  });

  describe('reinitialize', () => {
    it('should reinitialize with new configuration', () => {
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