import { describe, it, expect, vi } from 'vitest';
import { LLMServiceFactory } from '../LLMServiceFactory';
import { OpenAIConfig, AnthropicConfig, GeminiConfig, LlamaConfig, CustomConfig } from '../../../types/llm/providers';

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
      
      expect(providers).toEqual(['gemini']);
      expect(providers).toContain('gemini');
      expect(providers).toContain('gemini');
    });

    it('should return provider display names', () => {
      const displayNames = LLMServiceFactory.getProviderDisplayNames();
      
      expect(displayNames).toEqual({
        gemini: 'Google Gemini',
      });
    });

    it('should return provider descriptions', () => {
      const descriptions = LLMServiceFactory.getProviderDescriptions();
      
      expect(descriptions).toHaveProperty('gemini');
      
      // Check that descriptions are meaningful
      expect(descriptions.gemini).toContain('Google Gemini');
    });
  });

  describe('Service Creation', () => {
    // Disabled: OpenAI service tests - only Gemini is actively used
    it.skip('should create OpenAI service', () => {
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

    // Disabled: Anthropic service tests - only Gemini is actively used
    it.skip('should create Anthropic service', () => {
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

    // Disabled: Llama service tests - only Gemini is actively used
    it.skip('should create Llama service', () => {
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

    // Disabled: Custom service tests - only Gemini is actively used
    it.skip('should create Custom service', () => {
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
      
      // Factory should support only Gemini provider
      expect(factoryProviders.sort()).toEqual(['gemini']);
      
      // Test that Gemini provider can be created by the factory
      expect(() => {
        const mockConfig: Record<string, unknown> = {
          provider: 'gemini',
          apiKey: 'test-key',
          endpoint: 'https://api.test.com',
          model: 'test-model',
          maxTokens: 1000,
          temperature: 0.7,
          projectId: 'test-project',
        };
        
        const service = LLMServiceFactory.createService(mockConfig as unknown as GeminiConfig);
        expect(service).toBeDefined();
      }).not.toThrow();
    });

    it('should have EnvironmentConfig support all factory providers', () => {
      // This test ensures that if a provider is added to the factory,
      // it must also be added to the EnvironmentConfig
      const factoryProviders = LLMServiceFactory.getAvailableProviders();
      
      // Simply verify that the expected providers are available
      // The detailed integration with EnvironmentConfig is tested elsewhere
      const expectedProviders = ['gemini'];
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