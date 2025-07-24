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

describe('CRITICAL: Prompt System Core Functionality', () => {
  describe('Essential Prompt Building', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?'
    };

    it('should build a complete prompt with all placeholders replaced', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('es');
      expect(prompt).toContain('en');
      expect(prompt).toContain('a1');
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

    it('should include all general instructions', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for all general instructions
      expect(prompt).toContain('Maintain the story\'s meaning and narrative flow');
      expect(prompt).toContain('Preserve cultural context where appropriate');
      expect(prompt).toContain('Keep the story engaging and readable');
      expect(prompt).toContain('Provide only the translation without additional commentary');
    });

    it('should include all language-specific instruction types', () => {
      const prompt = generalPromptConfigService.buildPrompt(mockContext);
      
      // Check for all instruction types
      expect(prompt).toContain('Vocabulary:');
      expect(prompt).toContain('Grammar:');
      expect(prompt).toContain('Cultural:');
      expect(prompt).toContain('Style:');
      expect(prompt).toContain('Examples:');
    });
  });

  describe('Critical User Input Handling', () => {
    it('should handle special characters in text properly', () => {
      const contextWithSpecialChars: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás? ¡Qué tal!',
        nativeLanguage: 'es'
      };

      const prompt = generalPromptConfigService.buildPrompt(contextWithSpecialChars);
      
      // Should preserve special characters
      expect(prompt).toContain('¿cómo estás?');
      expect(prompt).toContain('¡Qué tal!');
    });

    it('should handle multi-line text properly', () => {
      const contextWithMultiLine: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?\nMe llamo María.\nTengo veinte años.',
        nativeLanguage: 'es'
      };

      const prompt = generalPromptConfigService.buildPrompt(contextWithMultiLine);
      
      // Should preserve line breaks in the story text
      expect(prompt).toContain('Hola, ¿cómo estás?\nMe llamo María.\nTengo veinte años.');
    });
  });

  describe('Critical Error Handling', () => {
    it('should handle unsupported language gracefully', () => {
      const unsupportedContext: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'unsupported',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?'
      };
      
      const prompt = generalPromptConfigService.buildPrompt(unsupportedContext);
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('es story to unsupported');
    });
  });
}); 