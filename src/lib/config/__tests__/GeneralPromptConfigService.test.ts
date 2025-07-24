import { generalPromptConfigService } from '../GeneralPromptConfigService';
import { PromptBuildContext } from '../../types/prompt';
import { vi } from 'vitest';

// Mock the LanguageService
vi.mock('../../../api/supabase/database/languageService', () => ({
  LanguageService: vi.fn().mockImplementation(() => ({
    getLanguageName: vi.fn().mockImplementation((code: string) => {
      const languageNames: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese'
      };
      return Promise.resolve(languageNames[code.toLowerCase()] || code);
    })
  }))
}));

// Mock the PromptConfigurationService
vi.mock('../../../api/supabase/database/promptConfigurationService', () => ({
  PromptConfigurationService: vi.fn().mockImplementation(() => ({
    getPromptConfiguration: vi.fn().mockImplementation((languageCode: string, difficultyCode: string) => {
      // Return null for unsupported combinations to trigger JSON fallback
      if (languageCode === 'unsupported' || difficultyCode === 'unsupported') {
        return Promise.resolve(null);
      }
      
      // Return mock configuration for supported combinations
      const mockConfig = {
        id: 'mock-id',
        language_id: 'mock-language-id',
        difficulty_level_id: 'mock-difficulty-id',
        vocabulary: 'Use appropriate vocabulary for ' + difficultyCode,
        grammar: 'Use appropriate grammar for ' + difficultyCode,
        cultural: 'Handle cultural references appropriately',
        style: 'Use appropriate style for ' + difficultyCode,
        examples: 'Provide appropriate examples',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        language: { code: languageCode, name: 'Mock Language' },
        difficulty_level: { code: difficultyCode, name: 'Mock Difficulty' }
      };
      return Promise.resolve(mockConfig);
    }),
    hasPromptConfiguration: vi.fn().mockImplementation((languageCode: string, difficultyCode: string) => {
      return Promise.resolve(languageCode !== 'unsupported' && difficultyCode !== 'unsupported');
    }),
    getAvailableLanguageCodes: vi.fn().mockResolvedValue(['en', 'es']),
    getAvailableDifficultyCodes: vi.fn().mockImplementation((languageCode: string) => {
      if (languageCode === 'unsupported') {
        return Promise.resolve([]);
      }
      return Promise.resolve(['a1', 'a2', 'b1', 'b2']);
    })
  }))
}));

describe('PromptConfigService', () => {
  describe('getLanguageInstructions', () => {
    it('should return instructions for supported language and difficulty', async () => {
      const instructions = await generalPromptConfigService.getLanguageInstructions('en', 'a1');
      
      expect(instructions).toBeDefined();
      expect(instructions?.vocabulary).toBeDefined();
      expect(instructions?.grammar).toBeDefined();
      expect(instructions?.cultural).toBeDefined();
      expect(instructions?.style).toBeDefined();
      expect(instructions?.examples).toBeDefined();
    });

    it('should return null for unsupported language', async () => {
      const instructions = await generalPromptConfigService.getLanguageInstructions('unsupported', 'a1');
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported difficulty', async () => {
      const instructions = await generalPromptConfigService.getLanguageInstructions('en', 'unsupported');
      expect(instructions).toBeNull();
    });

    it('should handle case insensitive language codes', async () => {
      const instructionsLower = await generalPromptConfigService.getLanguageInstructions('en', 'a1');
      const instructionsUpper = await generalPromptConfigService.getLanguageInstructions('EN', 'A1');
      
      // Both should return the same mock data since the mock normalizes to lowercase
      expect(instructionsLower).toBeDefined();
      expect(instructionsUpper).toBeDefined();
      expect(instructionsLower?.vocabulary).toContain('a1');
      expect(instructionsUpper?.vocabulary).toContain('A1'); // Mock preserves the case as passed
    });
  });

  describe('getGeneralInstructions', () => {
    it('should return array of general instructions', () => {
      const instructions = generalPromptConfigService.getGeneralInstructions();
      
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions).toContain('Maintain the story\'s meaning and narrative flow');
    });
  });

  describe('getTemplate', () => {
    it('should return the prompt template', () => {
      const template = generalPromptConfigService.getTemplate();
      
      expect(typeof template).toBe('string');
      expect(template).toContain('{fromLanguage}');
      expect(template).toContain('{toLanguage}');
      expect(template).toContain('{difficulty}');
      expect(template).toContain('{instructions}');
      expect(template).toContain('{languageInstructions}');
      expect(template).toContain('{text}');
    });
  });

  describe('buildPrompt', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?'
    };

    it('should build a complete prompt with all placeholders replaced', async () => {
      const prompt = await generalPromptConfigService.buildPrompt(mockContext);
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('Spanish');
      expect(prompt).toContain('English');
      expect(prompt).toContain('A1');
      expect(prompt).toContain('Hola, ¿cómo estás?');
      expect(prompt).toContain('Vocabulary:');
      expect(prompt).toContain('Grammar:');
      
      // Ensure no template placeholders remain
      expect(prompt).not.toContain('{fromLanguage}');
      expect(prompt).not.toContain('{toLanguage}');
      expect(prompt).not.toContain('{difficulty}');
      expect(prompt).not.toContain('{instructions}');
      expect(prompt).not.toContain('{languageInstructions}');
      expect(prompt).not.toContain('{text}');
    });

    it('should handle unsupported language gracefully', async () => {
      const unsupportedContext: PromptBuildContext = {
        ...mockContext,
        toLanguage: 'unsupported'
      };
      
      const prompt = await generalPromptConfigService.buildPrompt(unsupportedContext);
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('Adapt the translation for A1 CEFR level complexity');
    });

    it('should build different prompts for different difficulty levels', async () => {
      const a1Context = { ...mockContext, difficulty: 'a1' };
      const b2Context = { ...mockContext, difficulty: 'b2' };
      
      const a1Prompt = await generalPromptConfigService.buildPrompt(a1Context);
      const b2Prompt = await generalPromptConfigService.buildPrompt(b2Context);
      
      expect(a1Prompt).not.toEqual(b2Prompt);
      expect(a1Prompt).toContain('Use appropriate vocabulary for a1');
      expect(b2Prompt).toContain('Use appropriate vocabulary for b2');
    });

    it('should build different prompts for different languages', async () => {
      const enContext = { ...mockContext, toLanguage: 'en' };
      const esContext = { ...mockContext, fromLanguage: 'en', toLanguage: 'es', text: 'Hello, how are you?' };
      
      const enPrompt = await generalPromptConfigService.buildPrompt(enContext);
      const esPrompt = await generalPromptConfigService.buildPrompt(esContext);
      
      expect(enPrompt).not.toEqual(esPrompt);
      expect(enPrompt).toContain('English');
      expect(esPrompt).toContain('Spanish');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array of available language codes', async () => {
      const languages = await generalPromptConfigService.getAvailableLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
    });
  });

  describe('getAvailableDifficulties', () => {
    it('should return difficulties for supported language', async () => {
      const difficulties = await generalPromptConfigService.getAvailableDifficulties('en');
      
      expect(Array.isArray(difficulties)).toBe(true);
      expect(difficulties).toContain('a1');
      expect(difficulties).toContain('a2');
      expect(difficulties).toContain('b1');
      expect(difficulties).toContain('b2');
    });

    it('should return empty array for unsupported language', async () => {
      const difficulties = await generalPromptConfigService.getAvailableDifficulties('unsupported');
      expect(difficulties).toEqual([]);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported combinations', async () => {
      expect(await generalPromptConfigService.isSupported('en', 'a1')).toBe(true);
      expect(await generalPromptConfigService.isSupported('es', 'b2')).toBe(true);
    });

    it('should return false for unsupported language', async () => {
      expect(await generalPromptConfigService.isSupported('unsupported', 'a1')).toBe(false);
    });

    it('should return false for unsupported difficulty', async () => {
      expect(await generalPromptConfigService.isSupported('en', 'unsupported')).toBe(false);
    });

    it('should be case insensitive', async () => {
      expect(await generalPromptConfigService.isSupported('EN', 'A1')).toBe(true);
      expect(await generalPromptConfigService.isSupported('Es', 'B2')).toBe(true);
    });
  });
}); 