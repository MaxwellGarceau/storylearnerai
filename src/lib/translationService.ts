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
}

export interface TranslationError {
  message: string;
  code: string;
}

class TranslationService {
  private apiEndpoint: string;

  constructor() {
    // TODO: Configure this with environment variables
    this.apiEndpoint = '/api/translate';
  }

  async translateStory(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          fromLanguage: request.fromLanguage,
          toLanguage: request.toLanguage,
          difficulty: request.difficulty,
          prompt: this.buildTranslationPrompt(request),
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        originalText: request.text,
        translatedText: data.translatedText,
        fromLanguage: request.fromLanguage,
        toLanguage: request.toLanguage,
        difficulty: request.difficulty,
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
    };
  }
}

export const translationService = new TranslationService(); 