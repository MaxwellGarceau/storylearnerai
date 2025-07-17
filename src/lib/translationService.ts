import { llmServiceManager } from './llm/LLMServiceManager';
import { EnvironmentConfig } from './config/env';

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  difficulty: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  difficulty: string;
  provider?: string;
  model?: string;
}

export interface TranslationError {
  message: string;
  code: string;
}

class TranslationService {
  constructor() {
    // Environment configuration is now handled by LLMServiceManager
  }

  async translateStory(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const prompt = this.buildTranslationPrompt(request);
      
      const llmResponse = await llmServiceManager.generateCompletion({
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      return {
        originalText: request.text,
        translatedText: llmResponse.content,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
        provider: llmResponse.provider,
        model: llmResponse.model,
      };
    } catch (error) {
      console.error('Translation service error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Translation service unavailable'
      );
    }
  }

  private buildTranslationPrompt(request: TranslationRequest): string {
    return `
      Translate the following Spanish story to English, adapted for ${request.difficulty} CEFR level:
      
      Instructions:
      - Maintain the story's meaning and narrative flow
      - Adapt vocabulary and sentence complexity to ${request.difficulty} level
      - Preserve cultural context where appropriate
      - Keep the story engaging and readable
      
      Spanish Story:
      ${request.text}
      
      Please provide only the English translation.
    `;
  }

  // Mock translation for development/testing
  async mockTranslateStory(request: TranslationRequest): Promise<TranslationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock translation result
    const mockTranslation = `[TRANSLATED FROM SPANISH - ${request.difficulty} LEVEL]\n\n${request.text}\n\n[This is a mock translation for development purposes]`;
    
    return {
      originalText: request.text,
      translatedText: mockTranslation,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      provider: 'mock',
      model: 'mock-model',
    };
  }

  // New method to check if the LLM service is available
  async isLLMServiceAvailable(): Promise<boolean> {
    if (EnvironmentConfig.isDevelopment()) {
      return false; // Use mock in development by default
    }
    
    try {
      return await llmServiceManager.healthCheck();
    } catch (error) {
      console.warn('LLM service health check failed:', error);
      return false;
    }
  }

  // Method to get current LLM provider info
  getLLMProviderInfo(): { provider: string; model: string } {
    return {
      provider: llmServiceManager.getProvider(),
      model: llmServiceManager.getModel(),
    };
  }
}

export const translationService = new TranslationService(); 