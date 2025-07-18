import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translationService } from '../translationService';
import { EnvironmentConfig } from '../config/env';
import type { TranslationRequest } from '../translationService';

// Mock the dependencies
vi.mock('../config/env', () => ({
  EnvironmentConfig: {
    isMockTranslationEnabled: vi.fn(),
  },
}));

vi.mock('../llm/LLMServiceManager', () => ({
  llmServiceManager: {
    generateCompletion: vi.fn(),
    healthCheck: vi.fn(),
    getProvider: vi.fn().mockReturnValue('openai'),
    getModel: vi.fn().mockReturnValue('gpt-4o-mini'),
  },
}));

const mockEnvironmentConfig = vi.mocked(EnvironmentConfig);

describe('TranslationService', () => {
  const mockRequest: TranslationRequest = {
    text: 'Esta es una historia de prueba.',
    fromLanguage: 'Spanish',
    toLanguage: 'English',
    difficulty: 'A1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('translate method', () => {
    it('should use mock translation when ENABLE_MOCK_TRANSLATION is true', async () => {
      // Mock environment to enable mock translation
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(true);

      // Spy on the private methods to verify which is called
      const mockTranslateSpy = vi.spyOn(translationService, 'mockTranslateStory');
      const realTranslateSpy = vi.spyOn(translationService, 'translateStory');

      await translationService.translate(mockRequest);

      // Verify mock translation was called
      expect(mockTranslateSpy).toHaveBeenCalledWith(mockRequest);
      expect(realTranslateSpy).not.toHaveBeenCalled();
    });

    it('should use real translation when ENABLE_MOCK_TRANSLATION is false', async () => {
      // Mock environment to disable mock translation
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(false);

      // Mock the LLM service response
      const { llmServiceManager } = await import('../llm/LLMServiceManager');
      vi.mocked(llmServiceManager.generateCompletion).mockResolvedValue({
        content: 'This is a test story.',
        provider: 'openai',
        model: 'gpt-4o-mini',
      });

      // Spy on the private methods to verify which is called
      const mockTranslateSpy = vi.spyOn(translationService, 'mockTranslateStory');
      const realTranslateSpy = vi.spyOn(translationService, 'translateStory');

      const result = await translationService.translate(mockRequest);

      // Verify real translation was called
      expect(realTranslateSpy).toHaveBeenCalledWith(mockRequest);
      expect(mockTranslateSpy).not.toHaveBeenCalled();

      // Verify the result comes from the real translation service
      expect(result.translatedText).toBe('This is a test story.');
      expect(result.provider).toBe('openai');
    });

    it('should return mock response with correct structure when using mock translation', async () => {
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(true);

      const result = await translationService.translate(mockRequest);

      expect(result).toEqual({
        originalText: mockRequest.text,
        translatedText: `[TRANSLATED FROM SPANISH - ${mockRequest.difficulty} LEVEL]\n\n${mockRequest.text}\n\n[This is a mock translation for development purposes]`,
        fromLanguage: 'Spanish',
        toLanguage: 'English',
        difficulty: 'A1',
        provider: 'mock',
        model: 'mock-model',
      });
    });
  });

  describe('isLLMServiceAvailable', () => {
    it('should return true when mock translation is enabled', async () => {
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(true);

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(true);
    });

    it('should check health when mock translation is disabled', async () => {
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(false);
      
      const { llmServiceManager } = await import('../llm/LLMServiceManager');
      vi.mocked(llmServiceManager.healthCheck).mockResolvedValue(true);

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(true);
      expect(llmServiceManager.healthCheck).toHaveBeenCalled();
    });

    it('should return false when health check fails', async () => {
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(false);
      
      const { llmServiceManager } = await import('../llm/LLMServiceManager');
      vi.mocked(llmServiceManager.healthCheck).mockRejectedValue(new Error('Service unavailable'));

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(false);
    });
  });

  describe('isMockTranslationEnabled', () => {
    it('should return the value from EnvironmentConfig', () => {
      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(true);
      expect(translationService.isMockTranslationEnabled()).toBe(true);

      mockEnvironmentConfig.isMockTranslationEnabled.mockReturnValue(false);
      expect(translationService.isMockTranslationEnabled()).toBe(false);
    });
  });
}); 