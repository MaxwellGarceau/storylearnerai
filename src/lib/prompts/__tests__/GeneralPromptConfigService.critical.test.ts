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

describe('CRITICAL: Prompt System Core Functionality', () => {
  describe('Essential Prompt Building', () => {
    const mockContext: PromptBuildContext = {
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      text: 'Hola, ¿cómo estás?',
    };

    it('should build a complete prompt with all placeholders replaced', async () => {
      const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

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

    it('should include all general instructions', async () => {
      const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for all general instructions
      expect(prompt).toContain(
        "Maintain the story's meaning and narrative flow"
      );
      expect(prompt).toContain('Preserve cultural context where appropriate');
      expect(prompt).toContain('Keep the story engaging and readable');
      expect(prompt).toContain(
        'Provide only the translation without additional commentary'
      );
    });

    it('should include all language-specific instruction types', async () => {
      const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

      // Check for all instruction types
      expect(prompt).toContain('Vocabulary:');
      expect(prompt).toContain('Grammar:');
      expect(prompt).toContain('Cultural:');
      expect(prompt).toContain('Style:');
      expect(prompt).toContain('Examples:');
    });
  });

  describe('Critical User Input Handling', () => {
    it('should handle special characters in text properly', async () => {
      const contextWithSpecialChars: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás? ¡Qué tal!',
        nativeLanguage: 'es',
      };

      const prompt = await generalPromptConfigService.buildTranslationPrompt(
        contextWithSpecialChars
      );

      // Should preserve special characters
      expect(prompt).toContain('¿cómo estás?');
      expect(prompt).toContain('¡Qué tal!');
    });

    it('should handle multi-line text properly', async () => {
      const contextWithMultiLine: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'en',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?\nMe llamo María.\nTengo veinte años.',
        nativeLanguage: 'es',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(contextWithMultiLine);

      // Should preserve line breaks in the story text
      expect(prompt).toContain(
        'Hola, ¿cómo estás?\nMe llamo María.\nTengo veinte años.'
      );
    });
  });

  describe('Critical Error Handling', () => {
    it('should handle unsupported language gracefully', async () => {
      const unsupportedContext: PromptBuildContext = {
        fromLanguage: 'es',
        toLanguage: 'unsupported',
        difficulty: 'a1',
        text: 'Hola, ¿cómo estás?',
      };

      const prompt =
        await generalPromptConfigService.buildTranslationPrompt(unsupportedContext);

      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('es story to unsupported');
    });
  });
});

describe('CRITICAL: Complete Prompt Structure Validation', () => {
  const mockContext: PromptBuildContext = {
    fromLanguage: 'es',
    toLanguage: 'en',
    difficulty: 'a1',
    text: 'Hola, ¿cómo estás?',
    nativeLanguage: 'es',
  };

  it('should have correct section ordering in the prompt', async () => {
    const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

    // Split prompt into lines to check ordering
    const lines = prompt.split('\n');

    // Find the main sections
    const headerIndex = lines.findIndex(line =>
      line.includes('Translate the following')
    );
    const instructionsIndex = lines.findIndex(line => line === 'Instructions:');
    const guidelinesIndex = lines.findIndex(line =>
      line.includes('Specific en Guidelines:')
    );
    const nativeGuidanceIndex = lines.findIndex(line =>
      line.includes('Native Speaker Guidance:')
    );
    const storyIndex = lines.findIndex(line => line === 'es Story:');
    const footerIndex = lines.findIndex(line =>
      line.includes('Please provide only the en translation')
    );

    // Verify correct ordering
    expect(headerIndex).toBeLessThan(instructionsIndex);
    expect(instructionsIndex).toBeLessThan(guidelinesIndex);
    expect(guidelinesIndex).toBeLessThan(nativeGuidanceIndex);
    expect(nativeGuidanceIndex).toBeLessThan(storyIndex);
    expect(storyIndex).toBeLessThan(footerIndex);
  });

  it('should have proper formatting with line breaks between sections', async () => {
    const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

    // Check for proper spacing between major sections
    expect(prompt).toMatch(/Instructions:\n/);
    expect(prompt).toMatch(/Specific en Guidelines:\n/);
    expect(prompt).toMatch(/es Story:\n/);
  });

  it('should have correct header format', async () => {
    const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

    // Check header format
    expect(prompt).toMatch(
      /^Translate the following es story to en, adapted for a1 CEFR level:/
    );
  });

  it('should have correct footer format', async () => {
    const prompt = await generalPromptConfigService.buildTranslationPrompt(mockContext);

    // Check footer format
    expect(prompt).toMatch(/Please provide only the en translation\.$/);
  });
});
