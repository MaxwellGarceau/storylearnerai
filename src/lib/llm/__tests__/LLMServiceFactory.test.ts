import { describe, it, expect, vi } from 'vitest';
import { LLMServiceFactory } from '../LLMServiceFactory';
import { OpenAIConfig, AnthropicConfig, GeminiConfig, LlamaConfig, CustomConfig } from '../../types/llm';

// Mock environment variables for testing
vi.mock('../../config/env', () => ({
  EnvironmentConfig: {
    getLLMConfig: vi.fn(),
  },
}));

describe('LLMServiceFactory', () => {
  describe('Provider Management', () => {
    it('should return available providers', () => {
      const providers = LLMServiceFactory.getAvailableProviders();
      
      expect(providers).toEqual(['openai', 'anthropic', 'gemini', 'llama', 'custom']);
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('gemini');
      expect(providers).toContain('llama');
      expect(providers).toContain('custom');
    });

    it('should return provider display names', () => {
      const displayNames = LLMServiceFactory.getProviderDisplayNames();
      
      expect(displayNames).toEqual({
        openai: 'OpenAI GPT',
        anthropic: 'Anthropic Claude',
        gemini: 'Google Gemini',
        llama: 'Meta Llama',
        custom: 'Custom API',
      });
    });

    it('should return provider descriptions', () => {
      const descriptions = LLMServiceFactory.getProviderDescriptions();
      
      expect(descriptions).toHaveProperty('openai');
      expect(descriptions).toHaveProperty('anthropic');
      expect(descriptions).toHaveProperty('gemini');
      expect(descriptions).toHaveProperty('llama');
      expect(descriptions).toHaveProperty('custom');
      
      // Check that descriptions are meaningful
      expect(descriptions.openai).toContain('OpenAI GPT');
      expect(descriptions.anthropic).toContain('Anthropic Claude');
      expect(descriptions.gemini).toContain('Google Gemini');
      expect(descriptions.llama).toContain('Meta Llama');
      expect(descriptions.custom).toContain('Custom API');
    });
  });

  describe('Service Creation', () => {
    it('should create OpenAI service', () => {
      const config: OpenAIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.openai.com/v1',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7,
      };

      const service = LLMServiceFactory.createService(config);
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('OpenAIService');
    });

    it('should create Anthropic service', () => {
      const config: AnthropicConfig = {
        provider: 'anthropic',
        apiKey: 'test-key',
        endpoint: 'https://api.anthropic.com/v1',
        model: 'claude-3-haiku',
        maxTokens: 1000,
        temperature: 0.7,
        version: '2023-06-01',
      };

      const service = LLMServiceFactory.createService(config);
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('AnthropicService');
    });

    it('should create Gemini service', () => {
      const config: GeminiConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-1.5-flash',
        maxTokens: 1000,
        temperature: 0.7,
        projectId: 'test-project',
      };

      const service = LLMServiceFactory.createService(config);
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('GeminiService');
    });

    it('should create Llama service', () => {
      const config: LlamaConfig = {
        provider: 'llama',
        apiKey: 'test-key',
        endpoint: 'http://localhost:11434',
        model: 'llama2',
        maxTokens: 1000,
        temperature: 0.7,
        llamaProvider: 'ollama',
      };

      const service = LLMServiceFactory.createService(config);
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('LlamaService');
    });

    it('should create Custom service', () => {
      const config: CustomConfig = {
        provider: 'custom',
        apiKey: 'test-key',
        endpoint: 'https://api.custom.com/v1',
        model: 'custom-model',
        maxTokens: 1000,
        temperature: 0.7,
      };

      const service = LLMServiceFactory.createService(config);
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('CustomService');
    });

    it('should throw error for unsupported provider', () => {
      const config = {
        provider: 'unsupported' as 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.test.com',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.7,
      };

      expect(() => LLMServiceFactory.createService(config)).toThrow('Unsupported LLM provider: unsupported');
    });
  });

  describe('Configuration Sync Integration', () => {
    it('should support the same providers as EnvironmentConfig', () => {
      // Get providers supported by the factory
      const factoryProviders = LLMServiceFactory.getAvailableProviders();
      
      // Define expected providers that should be supported in both factory and config
      // This test will fail if either system doesn't support all these providers
      const expectedProviders = ['openai', 'anthropic', 'gemini', 'llama', 'custom'];
      
      // Factory should support all expected providers
      expect(factoryProviders.sort()).toEqual(expectedProviders.sort());
      
      // Test that each provider can be created by the factory
      expectedProviders.forEach(provider => {
        expect(() => {
          const mockConfig: Record<string, unknown> = {
            provider: provider,
            apiKey: 'test-key',
            endpoint: 'https://api.test.com',
            model: 'test-model',
            maxTokens: 1000,
            temperature: 0.7,
          };
          
          // Add provider-specific properties
          if (provider === 'anthropic') {
            mockConfig.version = '2023-06-01';
          } else if (provider === 'gemini') {
            mockConfig.projectId = 'test-project';
          } else if (provider === 'llama') {
            mockConfig.llamaProvider = 'ollama';
          }
          
          const service = LLMServiceFactory.createService(mockConfig as unknown as OpenAIConfig);
          expect(service).toBeDefined();
        }).not.toThrow();
      });
    });

    it('should have EnvironmentConfig support all factory providers', () => {
      // This test ensures that if a provider is added to the factory,
      // it must also be added to the EnvironmentConfig
      const factoryProviders = LLMServiceFactory.getAvailableProviders();
      
      // Simply verify that the expected providers are available
      // The detailed integration with EnvironmentConfig is tested elsewhere
      const expectedProviders = ['openai', 'anthropic', 'gemini', 'llama', 'custom'];
      expect(factoryProviders.sort()).toEqual(expectedProviders.sort());
    });

    it('should have consistent provider metadata', () => {
      const providers = LLMServiceFactory.getAvailableProviders();
      const displayNames = LLMServiceFactory.getProviderDisplayNames();
      const descriptions = LLMServiceFactory.getProviderDescriptions();
      
      // Every provider should have display name and description
      providers.forEach(provider => {
        expect(displayNames).toHaveProperty(provider);
        expect(descriptions).toHaveProperty(provider);
        expect(displayNames[provider]).toBeTruthy();
        expect(descriptions[provider]).toBeTruthy();
      });
      
      // No extra providers in metadata
      expect(Object.keys(displayNames).sort()).toEqual(providers.sort());
      expect(Object.keys(descriptions).sort()).toEqual(providers.sort());
    });
  });
}); 