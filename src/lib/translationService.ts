import { llmServiceManager } from './llm/LLMServiceManager';
import { EnvironmentConfig } from './config/env';
import { generalPromptConfigService } from './prompts';
import { LanguageCode, DifficultyLevel } from './types/prompt';

export interface TranslationRequest {
  text: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  nativeLanguage?: LanguageCode; // Optional: user's native language for enhanced customization
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
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

  /**
   * Build a customized translation prompt based on language and difficulty level
   */
  private buildTranslationPrompt(request: TranslationRequest): string {
    const context = {
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      difficulty: request.difficulty,
      text: request.text,
      nativeLanguage: request.nativeLanguage
    };

    // If the configuration doesn't support this language/difficulty combination,
    // fall back to a basic prompt
    if (!generalPromptConfigService.isSupported(request.toLanguage, request.difficulty)) {
      console.warn(`Unsupported language/difficulty combination: ${request.toLanguage}/${request.difficulty}. Using fallback prompt.`);
      return this.buildFallbackPrompt(request);
    }

    // Use the prompt configuration service to build a customized prompt
    return generalPromptConfigService.buildPrompt(context);
  }

  /**
   * Fallback prompt for unsupported language/difficulty combinations
   */
  private buildFallbackPrompt(request: TranslationRequest): string {
    return `
      Translate the following ${request.fromLanguage} story to ${request.toLanguage}, adapted for ${request.difficulty} CEFR level:
      
      Instructions:
      - Maintain the story's meaning and narrative flow
      - Adapt vocabulary and sentence complexity to ${request.difficulty} level
      - Preserve cultural context where appropriate
      - Keep the story engaging and readable
      
      ${request.fromLanguage} Story:
      ${request.text}
      
      Please provide only the ${request.toLanguage} translation.
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

  // Smart translation method that chooses between mock and real based on environment
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (EnvironmentConfig.isMockTranslationEnabled()) {
      return await this.mockTranslateStory(request);
    } else {
      return await this.translateStory(request);
    }
  }

  // New method to check if the LLM service is available
  async isLLMServiceAvailable(): Promise<boolean> {
    if (EnvironmentConfig.isMockTranslationEnabled()) {
      return true; // Mock is always available
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

  // Method to check if mock translation is enabled
  isMockTranslationEnabled(): boolean {
    return EnvironmentConfig.isMockTranslationEnabled();
  }
}

export const translationService = new TranslationService(); 