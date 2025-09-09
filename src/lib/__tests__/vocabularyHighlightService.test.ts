import { describe, it, expect } from 'vitest';
import {
  VocabularyHighlightService,
  getVocabularyHighlightClass,
  type VocabularyHighlightState,
  type VocabularyHighlightOptions,
} from '../vocabularyHighlightService';

describe('VocabularyHighlightService', () => {
  describe('getHighlightClass', () => {
    it('should return included vocabulary class when word is included', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-green-200 dark:bg-green-900/40');
    });

    it('should return saved vocabulary class when word is saved but not included', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-yellow-200 dark:bg-yellow-900/30');
    });

    it('should return translating class when word is translating but not saved or included', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: false,
        isTranslating: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-blue-200 dark:bg-blue-900/30 animate-pulse');
    });

    it('should return active class when word is active but not in other states', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: false,
        isTranslating: false,
        isActive: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-purple-200 dark:bg-purple-900/40');
    });

    it('should return empty string when no special states are active', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: false,
        isTranslating: false,
        isActive: false,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('');
    });

    it('should prioritize included vocabulary over saved state', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: true,
        isTranslating: true,
        isActive: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-green-200 dark:bg-green-900/40');
    });

    it('should prioritize saved over translating state', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: true,
        isTranslating: true,
        isActive: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-yellow-200 dark:bg-yellow-900/30');
    });

    it('should prioritize translating over active state', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: false,
        isTranslating: true,
        isActive: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-blue-200 dark:bg-blue-900/30 animate-pulse');
    });
  });

  describe('theme support', () => {
    it('should return high-contrast theme classes when specified', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const options: VocabularyHighlightOptions = {
        theme: 'high-contrast',
      };

      const result = VocabularyHighlightService.getHighlightClass(
        state,
        options
      );
      expect(result).toBe(
        'bg-green-300 dark:bg-green-800 border border-green-400'
      );
    });

    it('should return colorblind-friendly theme classes when specified', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: true,
      };

      const options: VocabularyHighlightOptions = {
        theme: 'colorblind-friendly',
      };

      const result = VocabularyHighlightService.getHighlightClass(
        state,
        options
      );
      expect(result).toBe(
        'bg-amber-200 dark:bg-amber-900/40 border border-amber-300'
      );
    });

    it('should default to default theme when no theme specified', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('bg-green-200 dark:bg-green-900/40');
    });
  });

  describe('accessibility support', () => {
    it('should add accessibility classes when accessible option is true', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const options: VocabularyHighlightOptions = {
        accessible: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(
        state,
        options
      );
      expect(result).toBe(
        'bg-green-200 dark:bg-green-900/40 focus:ring-2 focus:ring-offset-2 focus:ring-current'
      );
    });

    it('should combine accessibility with theme options', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: true,
      };

      const options: VocabularyHighlightOptions = {
        theme: 'high-contrast',
        accessible: true,
      };

      const result = VocabularyHighlightService.getHighlightClass(
        state,
        options
      );
      expect(result).toBe(
        'bg-yellow-300 dark:bg-yellow-800 border border-yellow-400 focus:ring-2 focus:ring-offset-2 focus:ring-current'
      );
    });
  });

  describe('utility methods', () => {
    it('should return available states', () => {
      const states = VocabularyHighlightService.getAvailableStates();
      expect(states).toEqual(['included', 'saved', 'translating', 'active']);
    });

    it('should return available themes', () => {
      const themes = VocabularyHighlightService.getAvailableThemes();
      expect(themes).toEqual([
        'default',
        'high-contrast',
        'colorblind-friendly',
      ]);
    });

    it('should validate correct state objects', () => {
      const validState: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
        isTranslating: true,
        isActive: false,
        isDisabled: true,
      };

      expect(VocabularyHighlightService.isValidState(validState)).toBe(true);
    });

    it('should reject invalid state objects', () => {
      const invalidState = {
        isIncludedVocabulary: 'true', // should be boolean
        isSaved: false,
      };

      expect(
        VocabularyHighlightService.isValidState(
          invalidState as unknown as VocabularyHighlightState
        )
      ).toBe(false);
    });

    it('should handle partial state objects', () => {
      const partialState: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
        // isTranslating, isActive, isDisabled are optional
      };

      expect(VocabularyHighlightService.isValidState(partialState)).toBe(true);
    });
  });

  describe('convenience function', () => {
    it('should work the same as the service method', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const serviceResult = VocabularyHighlightService.getHighlightClass(state);
      const functionResult = getVocabularyHighlightClass(state);

      expect(functionResult).toBe(serviceResult);
    });

    it('should pass options correctly', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: true,
      };

      const options: VocabularyHighlightOptions = {
        theme: 'high-contrast',
        accessible: true,
      };

      const serviceResult = VocabularyHighlightService.getHighlightClass(
        state,
        options
      );
      const functionResult = getVocabularyHighlightClass(state, options);

      expect(functionResult).toBe(serviceResult);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined optional properties', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: false,
        isSaved: false,
        isTranslating: undefined,
        isActive: undefined,
        isDisabled: undefined,
      };

      const result = VocabularyHighlightService.getHighlightClass(state);
      expect(result).toBe('');
    });

    it('should handle empty options object', () => {
      const state: VocabularyHighlightState = {
        isIncludedVocabulary: true,
        isSaved: false,
      };

      const result = VocabularyHighlightService.getHighlightClass(state, {});
      expect(result).toBe('bg-green-200 dark:bg-green-900/40');
    });
  });
});
