import { promptConfigService } from '../PromptConfigService';
import { PromptBuildContext } from '../../types/prompt';

describe('PromptConfigService', () => {
  describe('getLanguageInstructions', () => {
    it('should return instructions for supported language and difficulty', () => {
      const instructions = promptConfigService.getLanguageInstructions('en', 'a1');
      
      expect(instructions).toBeDefined();
      expect(instructions?.vocabulary).toBeDefined();
      expect(instructions?.grammar).toBeDefined();
      expect(instructions?.cultural).toBeDefined();
      expect(instructions?.style).toBeDefined();
      expect(instructions?.examples).toBeDefined();
    });

    it('should return null for unsupported language', () => {
      const instructions = promptConfigService.getLanguageInstructions('unsupported', 'a1');
      expect(instructions).toBeNull();
    });

    it('should return null for unsupported difficulty', () => {
      const instructions = promptConfigService.getLanguageInstructions('en', 'unsupported');
      expect(instructions).toBeNull();
    });

    it('should handle case insensitive language codes', () => {
      const instructionsLower = promptConfigService.getLanguageInstructions('en', 'a1');
      const instructionsUpper = promptConfigService.getLanguageInstructions('EN', 'A1');
      
      expect(instructionsLower).toEqual(instructionsUpper);
    });
  });

  describe('getGeneralInstructions', () => {
    it('should return array of general instructions', () => {
      const instructions = promptConfigService.getGeneralInstructions();
      
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions).toContain('Maintain the story\'s meaning and narrative flow');
    });
  });

  describe('getTemplate', () => {
    it('should return the prompt template', () => {
      const template = promptConfigService.getTemplate();
      
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

    it('should build a complete prompt with all placeholders replaced', () => {
      const prompt = promptConfigService.buildPrompt(mockContext);
      
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

    it('should handle unsupported language gracefully', () => {
      const unsupportedContext: PromptBuildContext = {
        ...mockContext,
        toLanguage: 'unsupported'
      };
      
      const prompt = promptConfigService.buildPrompt(unsupportedContext);
      
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('Adapt the translation for A1 CEFR level complexity');
    });

    it('should build different prompts for different difficulty levels', () => {
      const a1Context = { ...mockContext, difficulty: 'a1' };
      const b2Context = { ...mockContext, difficulty: 'b2' };
      
      const a1Prompt = promptConfigService.buildPrompt(a1Context);
      const b2Prompt = promptConfigService.buildPrompt(b2Context);
      
      expect(a1Prompt).not.toEqual(b2Prompt);
      expect(a1Prompt).toContain('most common 1000 English words');
      expect(b2Prompt).toContain('upper-intermediate vocabulary');
    });

    it('should build different prompts for different languages', () => {
      const enContext = { ...mockContext, toLanguage: 'en' };
      const esContext = { ...mockContext, fromLanguage: 'en', toLanguage: 'es', text: 'Hello, how are you?' };
      
      const enPrompt = promptConfigService.buildPrompt(enContext);
      const esPrompt = promptConfigService.buildPrompt(esContext);
      
      expect(enPrompt).not.toEqual(esPrompt);
      expect(enPrompt).toContain('English');
      expect(esPrompt).toContain('Spanish');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array of available language codes', () => {
      const languages = promptConfigService.getAvailableLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
    });
  });

  describe('getAvailableDifficulties', () => {
    it('should return difficulties for supported language', () => {
      const difficulties = promptConfigService.getAvailableDifficulties('en');
      
      expect(Array.isArray(difficulties)).toBe(true);
      expect(difficulties).toContain('a1');
      expect(difficulties).toContain('a2');
      expect(difficulties).toContain('b1');
      expect(difficulties).toContain('b2');
    });

    it('should return empty array for unsupported language', () => {
      const difficulties = promptConfigService.getAvailableDifficulties('unsupported');
      expect(difficulties).toEqual([]);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported combinations', () => {
      expect(promptConfigService.isSupported('en', 'a1')).toBe(true);
      expect(promptConfigService.isSupported('es', 'b2')).toBe(true);
    });

    it('should return false for unsupported language', () => {
      expect(promptConfigService.isSupported('unsupported', 'a1')).toBe(false);
    });

    it('should return false for unsupported difficulty', () => {
      expect(promptConfigService.isSupported('en', 'unsupported')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(promptConfigService.isSupported('EN', 'A1')).toBe(true);
      expect(promptConfigService.isSupported('Es', 'B2')).toBe(true);
    });
  });
}); 