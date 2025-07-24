import { generalPromptConfigService } from '../GeneralPromptConfigService';
import { PromptBuildContext } from '../../types/prompt';
import { vi } from 'vitest';

// Mock the dynamic imports for native-to-target configurations
vi.mock('../config/native-to-target/en/es.json', () => ({
  default: {
    a1: {
      description: 'Maximum scaffolding for absolute beginners',
      grammar_focus: {
        noun_gender: 'STRICTLY ADHERE to noun-article pairing',
        verb_conjugation: 'Use only the Present Tense'
      },
      vocabulary_focus: {
        word_choice: 'Use high-frequency vocabulary'
      }
    }
  }
}));

vi.mock('../config/native-to-target/es/en.json', () => ({
  default: {
    a1: {
      description: 'Maximum scaffolding for absolute beginners',
      grammar_focus: {
        subject_pronouns: 'STRICTLY ENFORCE subject pronouns',
        adjective_placement: 'STRICTLY ENFORCE adjective-before-noun word order'
      },
      vocabulary_focus: {
        false_friends: 'STRICTLY AVOID common English-Spanish false friends'
      }
    }
  }
}));





/**
 * Comprehensive Prompt System Tests
 * 
 * CRITICAL tests are in: GeneralPromptConfigService.critical.test.ts
 * This file contains comprehensive validation and edge case testing
 */
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
      expect(instructionsLower?.vocabulary).toContain('1000 English words');
      expect(instructionsUpper?.vocabulary).toContain('1000 English words');
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

  describe('buildPrompt - Comprehensive Validation', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?'
    };

    it('should build different prompts for different difficulty levels', async () => {
      const a1Context = { ...mockContext, difficulty: 'a1' };
      const b2Context = { ...mockContext, difficulty: 'b2' };
      
      const a1Prompt = await generalPromptConfigService.buildPrompt(a1Context);
      const b2Prompt = await generalPromptConfigService.buildPrompt(b2Context);
      
      expect(a1Prompt).not.toEqual(b2Prompt);
      expect(a1Prompt).toContain('most common 1000 English words');
      expect(b2Prompt).toContain('upper-intermediate vocabulary');
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

  describe('Native-to-Target Instructions', () => {
    it('should return native-to-target instructions for supported combinations', () => {
      const instructions = generalPromptConfigService.getNativeToTargetInstructions('en', 'es', 'a1');
      expect(instructions).toBeTruthy();
      expect(instructions?.description).toContain('Maximum scaffolding');
      expect(instructions?.grammar_focus).toBeDefined();
      expect(instructions?.vocabulary_focus).toBeDefined();
    });

    it('should return null for unsupported native language', () => {
      const instructions = generalPromptConfigService.getNativeToTargetInstructions('fr', 'es', 'a1');
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported target language', () => {
      const instructions = generalPromptConfigService.getNativeToTargetInstructions('en', 'fr', 'a1');
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported difficulty', () => {
      const instructions = generalPromptConfigService.getNativeToTargetInstructions('en', 'es', 'c1');
      expect(instructions).toBeNull();
    });

    it('should build prompt with native-to-target instructions when native language is provided', () => {
      const context = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
        nativeLanguage: 'es'
      };

      const prompt = generalPromptConfigService.buildPrompt(context);
      expect(prompt).toContain('Native Speaker Guidance');
      expect(prompt).toContain('Grammar Focus');
      expect(prompt).toContain('Vocabulary Focus');
    });

    it('should build prompt without native-to-target instructions when native language is not provided', () => {
      const context = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?'
      };

      const prompt = generalPromptConfigService.buildPrompt(context);
      expect(prompt).not.toContain('Native Speaker Guidance');
    });
  });

  describe('Advanced User Input Handling', () => {
    it('should handle empty text gracefully', () => {
      const contextWithEmptyText: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: '',
        nativeLanguage: 'es'
      };

      const prompt = generalPromptConfigService.buildPrompt(contextWithEmptyText);
      
      // Should handle empty text without errors
      expect(prompt).toContain('es Story:');
      expect(prompt).toContain('Please provide only the en translation');
    });

    it('should handle text with quotes and apostrophes', () => {
      const contextWithQuotes: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'She said "Hello, how are you?" and he replied "I\'m fine, thanks!"',
        nativeLanguage: 'es'
      };

      const prompt = generalPromptConfigService.buildPrompt(contextWithQuotes);
      
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
      nativeLanguage: 'es'
    };



    it('should include native-to-target instruction sections when native language is provided', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for native-to-target sections
      expect(prompt).toContain('Native Speaker Guidance:');
      expect(prompt).toContain('Grammar Focus:');
      expect(prompt).toContain('Vocabulary Focus:');
    });

    it('should not include native-to-target sections when native language is not provided', () => {
      const contextWithoutNative: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?'
      };

      const prompt = generalPromptConfigService.buildPrompt(contextWithoutNative);
      
      // Should not contain native-to-target sections
      expect(prompt).not.toContain('Native Speaker Guidance:');
      expect(prompt).not.toContain('Grammar Focus:');
      expect(prompt).not.toContain('Vocabulary Focus:');
    });

    it('should include specific vocabulary instructions for A1 level', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for A1-specific vocabulary instructions
      expect(prompt).toContain('1000 English words');
      expect(prompt).toContain('simple alternatives');
    });

    it('should include specific grammar instructions for A1 level', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for A1-specific grammar instructions
      expect(prompt).toContain('present simple');
      expect(prompt).toContain('past simple');
      expect(prompt).toContain('present continuous');
    });

    it('should include specific style instructions for A1 level', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for A1-specific style instructions
      expect(prompt).toContain('5-10 words');
      expect(prompt).toContain('compound and complex sentences');
    });

    it('should include native-to-target grammar focus instructions', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for native-to-target grammar instructions
      expect(prompt).toContain('SUBJECT PRONOUNS:');
      expect(prompt).toContain('ADJECTIVE PLACEMENT:');
    });

    it('should include native-to-target vocabulary focus instructions', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for native-to-target vocabulary instructions
      expect(prompt).toContain('FALSE FRIENDS:');
    });

    it('should generate different content for different difficulty levels', () => {
      const a1Context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
        nativeLanguage: 'es'
      };

      const b2Context: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'b2',
        text: 'Hola, ¿cómo estás?',
        nativeLanguage: 'es'
      };

      const a1Prompt = generalPromptConfigService.buildPrompt(a1Context);
      const b2Prompt = generalPromptConfigService.buildPrompt(b2Context);

      // A1 should contain beginner-specific content
      expect(a1Prompt).toContain('1000 English words');
      expect(a1Prompt).toContain('present simple');

      // B2 should contain intermediate-specific content
      expect(b2Prompt).toContain('upper-intermediate vocabulary');
      expect(b2Prompt).toContain('sophisticated sentence structures');
    });

    it('should generate different content for different target languages', () => {
      const enContext: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
        nativeLanguage: 'es'
      };

      const esContext: PromptBuildContext = {
        fromLanguage: 'en',
        toLanguage: 'es',
        difficulty: 'a1',
        text: 'Hello, how are you?',
        nativeLanguage: 'en'
      };

      const enPrompt = generalPromptConfigService.buildPrompt(enContext);
      const esPrompt = generalPromptConfigService.buildPrompt(esContext);

      // English target should contain English-specific instructions
      expect(enPrompt).toContain('English words');
      expect(enPrompt).toContain('en translation');

      // Spanish target should contain Spanish-specific instructions
      expect(esPrompt).toContain('Spanish words');
      expect(esPrompt).toContain('es translation');
    });
  });
}); 