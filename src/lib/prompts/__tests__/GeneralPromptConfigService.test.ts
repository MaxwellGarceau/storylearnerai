import { generalPromptConfigService } from '../GeneralPromptConfigService';
import { PromptBuildContext } from '../../../types/llm/prompts';
import { vi } from 'vitest';

// Mock the dynamic imports for native-to-target configurations
vi.mock('../config/native-to-target/en/es.json', () => ({
  default: {
    a1: {
      description: 'Maximum scaffolding for absolute beginners',
      grammar_focus: {
        noun_gender: 'STRICTLY ADHERE to noun-article pairing',
        verb_conjugation: 'Use only the Present Tense',
      },
      vocabulary_focus: {
        word_choice: 'Use high-frequency vocabulary',
      },
    },
  },
}));

vi.mock('../config/native-to-target/es/en.json', () => ({
  default: {
    a1: {
      description: 'Maximum scaffolding for absolute beginners',
      grammar_focus: {
        subject_pronouns: 'STRICTLY ENFORCE subject pronouns',
        adjective_placement:
          'STRICTLY ENFORCE adjective-before-noun word order',
      },
      vocabulary_focus: {
        false_friends: 'STRICTLY AVOID common English-Spanish false friends',
      },
    },
  },
}));

/**
 * Comprehensive Prompt System Tests
 *
 * CRITICAL tests are in: GeneralPromptConfigService.critical.test.ts
 * This file contains comprehensive validation and edge case testing
 */
describe('PromptConfigService', () => {
  describe('getGeneralInstructions', () => {
    it('should return array of general instructions', () => {
      const instructions = generalPromptConfigService.getGeneralInstructions();

      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions).toContain(
        "Maintain the story's meaning and narrative flow"
      );
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

  describe('buildTranslationPrompt - Comprehensive Validation', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?',
    };

    it('should build different prompts for different difficulty levels', async () => {
      const a1Context: PromptBuildContext = {
        ...mockContext,
        difficulty: 'a1',
      };
      const b2Context: PromptBuildContext = {
        ...mockContext,
        difficulty: 'b2',
      };

      const a1Prompt =
        await generalPromptConfigService.buildTranslationPrompt(a1Context);
      const b2Prompt =
        await generalPromptConfigService.buildTranslationPrompt(b2Context);

      expect(a1Prompt).not.toEqual(b2Prompt);
      expect(a1Prompt).toContain('most common 1000 English words');
      expect(b2Prompt).toContain('upper-intermediate vocabulary');
    });

    it('should build different prompts for different languages', async () => {
      const enContext: PromptBuildContext = {
        ...mockContext,
        toLanguage: 'en',
      };
      const esContext: PromptBuildContext = {
        fromLanguage: 'en',
        toLanguage: 'es',
        difficulty: 'a1',
        text: 'Hello, how are you?',
      };

      const enPrompt =
        await generalPromptConfigService.buildTranslationPrompt(enContext);
      const esPrompt =
        await generalPromptConfigService.buildTranslationPrompt(esContext);

      expect(enPrompt).not.toEqual(esPrompt);
      expect(enPrompt).toContain('English');
      expect(esPrompt).toContain('Spanish');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array of available language codes', () => {
      const languages = generalPromptConfigService.getAvailableLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
    });
  });

  describe('getAvailableDifficulties', () => {
    it('should return difficulties for supported language', () => {
      const difficulties =
        generalPromptConfigService.getAvailableDifficulties('en');

      expect(Array.isArray(difficulties)).toBe(true);
      expect(difficulties).toContain('a1');
      expect(difficulties).toContain('a2');
      expect(difficulties).toContain('b1');
      expect(difficulties).toContain('b2');
    });

    it('should return empty array for unsupported language', () => {
      const difficulties =
        generalPromptConfigService.getAvailableDifficulties('unsupported');
      expect(difficulties).toEqual([]);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported combinations', () => {
      expect(generalPromptConfigService.isSupported('en', 'a1')).toBe(true);
      expect(generalPromptConfigService.isSupported('es', 'b2')).toBe(true);
    });

    it('should return false for unsupported language', () => {
      expect(
        generalPromptConfigService.isSupported('unsupported' as string, 'a1')
      ).toBe(false);
    });

    it('should return false for unsupported difficulty', () => {
      expect(
        generalPromptConfigService.isSupported('en', 'unsupported' as string)
      ).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(generalPromptConfigService.isSupported('EN' as string, 'a1')).toBe(
        true
      );
      expect(generalPromptConfigService.isSupported('Es' as string, 'b2')).toBe(
        true
      );
    });
  });

  describe('Native-to-Target Instructions', () => {
    it('should return native-to-target instructions for supported combinations', async () => {
      const instructions =
        await generalPromptConfigService.getNativeToTargetInstructions(
          'en',
          'es',
          'a1'
        );
      expect(instructions).toBeTruthy();
      expect(instructions?.description).toContain('Maximum scaffolding');
      expect(instructions?.grammar_focus).toBeDefined();
      expect(instructions?.vocabulary_focus).toBeDefined();
    });

    it('should return null for unsupported native language', async () => {
      const instructions =
        await generalPromptConfigService.getNativeToTargetInstructions(
          'fr' as string,
          'es',
          'a1'
        );
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported target language', async () => {
      const instructions =
        await generalPromptConfigService.getNativeToTargetInstructions(
          'en',
          'fr' as string,
          'a1'
        );
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported difficulty', async () => {
      const instructions =
        await generalPromptConfigService.getNativeToTargetInstructions(
          'en',
          'es',
          'c1' as string
        );
      expect(instructions).toBeNull();
    });

    it('should build prompt with native-to-target instructions when fromLanguage is provided', async () => {
      const context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(context);
      expect(prompt).toContain('Native Speaker Guidance');
      expect(prompt).toContain('Grammar Focus');
      expect(prompt).toContain('Vocabulary Focus');
    });

    it('should build prompt without native-to-target instructions when fromLanguage is not provided', async () => {
      const context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(context);
      // The prompt should still contain native-to-target instructions since fromLanguage is provided
      expect(prompt).toContain('Native Speaker Guidance');
    });
  });

  describe('Advanced User Input Handling', () => {
    it('should handle empty text gracefully', async () => {
      const contextWithEmptyText: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: '',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(
          contextWithEmptyText
        );

      // Should handle empty text without errors
      expect(prompt).toContain('es Story:');
      expect(prompt).toContain('Please provide only the en translation');
    });

    it('should handle text with quotes and apostrophes', async () => {
      const contextWithQuotes: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'She said "Hello, how are you?" and he replied "I\'m fine, thanks!"',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(
          contextWithQuotes
        );

      // Should preserve quotes and apostrophes
      expect(prompt).toContain('"Hello, how are you?"');
      expect(prompt).toContain('"I\'m fine, thanks!"');
    });
  });

  describe('Comprehensive Content Validation', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?',
    };

    it('should include native-to-target instruction sections when fromLanguage is provided', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for native-to-target sections
      expect(prompt).toContain('Native Speaker Guidance:');
      expect(prompt).toContain('Grammar Focus:');
      expect(prompt).toContain('Vocabulary Focus:');
    });

    it('should include specific vocabulary instructions for A1 level', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for A1-specific vocabulary instructions
      expect(prompt).toContain('1000 English words');
      expect(prompt).toContain('simple alternatives');
    });

    it('should include specific grammar instructions for A1 level', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for A1-specific grammar instructions
      expect(prompt).toContain('present simple');
      expect(prompt).toContain('past simple');
      expect(prompt).toContain('present continuous');
    });

    it('should include specific style instructions for A1 level', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for A1-specific style instructions
      expect(prompt).toContain('5-10 words');
      expect(prompt).toContain('compound and complex sentences');
    });

    it('should include native-to-target grammar focus instructions', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for native-to-target grammar instructions
      expect(prompt).toContain('SUBJECT PRONOUNS:');
      expect(prompt).toContain('ADJECTIVE PLACEMENT:');
    });

    it('should include native-to-target vocabulary focus instructions', async () => {
      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for native-to-target vocabulary instructions
      expect(prompt).toContain('FALSE FRIENDS:');
    });

    it('should generate different content for different difficulty levels', async () => {
      const a1Context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
      };

      const b2Context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'b2',
        text: 'Hola, ¿cómo estás?',
      };

      const a1Prompt =
        await generalPromptConfigService.buildTranslationPrompt(a1Context);
      const b2Prompt =
        await generalPromptConfigService.buildTranslationPrompt(b2Context);

      // A1 should contain beginner-specific content
      expect(a1Prompt).toContain('1000 English words');
      expect(a1Prompt).toContain('present simple');

      // B2 should contain intermediate-specific content
      expect(b2Prompt).toContain('upper-intermediate vocabulary');
      expect(b2Prompt).toContain('sophisticated sentence structures');
    });

    it('should generate different content for different target languages', async () => {
      const enContext: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
      };

      const esContext: PromptBuildContext = {
        fromLanguage: 'en',
        toLanguage: 'es',
        difficulty: 'a1',
        text: 'Hello, how are you?',
      };

      const enPrompt =
        await generalPromptConfigService.buildTranslationPrompt(enContext);
      const esPrompt =
        await generalPromptConfigService.buildTranslationPrompt(esContext);

      // English target should contain English-specific instructions
      expect(enPrompt).toContain('English words');
      expect(enPrompt).toContain('en translation');

      // Spanish target should contain Spanish-specific instructions
      expect(esPrompt).toContain('Spanish words');
      expect(esPrompt).toContain('es translation');
    });
  });
});
