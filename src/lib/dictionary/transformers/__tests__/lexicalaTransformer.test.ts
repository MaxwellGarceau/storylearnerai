import { describe, it, expect, vi } from 'vitest';
import { LexicalaDataTransformerImpl } from '../lexicalaTransformer';
import {
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
} from '../../../../types/dictionary';

describe('LexicalaDataTransformerImpl', () => {
  let transformer: LexicalaDataTransformerImpl;

  beforeEach(() => {
    transformer = new LexicalaDataTransformerImpl();
  });

  describe('transformLexicalaResponse', () => {
    it('should transform valid Lexicala API response', () => {
      const mockApiResponse = {
        word: 'hello',
        phonetic: 'həˈloʊ',
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'A greeting or an expression of goodwill.',
                example: 'She gave me a warm hello.',
                context: 'informal',
              },
            ],
            synonyms: ['greeting', 'salutation'],
            antonyms: ['goodbye', 'farewell'],
          },
          {
            partOfSpeech: 'verb',
            definitions: [
              {
                definition: 'To greet with "hello".',
                example: 'He helloed me from across the street.',
              },
            ],
          },
        ],
        etymology: 'From Old English hēlā, a compound of hēl and ā.',
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('hello');
      expect(result.phonetic).toBe('həˈloʊ');
      expect(result.etymology).toBe(
        'From Old English hēlā, a compound of hēl and ā.'
      );
      expect(result.source).toBe('Lexicala API');
      expect(result.lastUpdated).toBeDefined();

      // Check definitions
      expect(result.definitions).toHaveLength(2);
      expect(result.definitions[0]).toEqual({
        definition: 'A greeting or an expression of goodwill.',
        partOfSpeech: 'noun',
        examples: ['She gave me a warm hello.'],
        context: 'informal',
      });
      expect(result.definitions[1]).toEqual({
        definition: 'To greet with "hello".',
        partOfSpeech: 'verb',
        examples: ['He helloed me from across the street.'],
      });

      // Check parts of speech
      expect(result.partsOfSpeech).toHaveLength(2);
      expect(result.partsOfSpeech![0].type).toBe('noun');
      expect(result.partsOfSpeech![1].type).toBe('verb');

      // Check examples
      expect(result.examples).toEqual([
        'She gave me a warm hello.',
        'He helloed me from across the street.',
      ]);

      // Check synonyms and antonyms
      expect(result.synonyms).toEqual(['greeting', 'salutation']);
      expect(result.antonyms).toEqual(['goodbye', 'farewell']);

      // Check frequency
      expect(result.frequency).toBeDefined();
      expect(result.frequency!.level).toBe('common');
    });

    it('should handle response with minimal data', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            definitions: [
              {
                definition: 'A simple test.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe('A simple test.');
      expect(result.phonetic).toBeUndefined();
      expect(result.etymology).toBeUndefined();
      expect(result.partsOfSpeech).toBeUndefined();
      expect(result.examples).toBeUndefined();
      expect(result.synonyms).toBeUndefined();
      expect(result.antonyms).toBeUndefined();
    });

    it('should handle response with no meanings', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.partsOfSpeech).toBeUndefined();
      expect(result.examples).toBeUndefined();
      expect(result.synonyms).toBeUndefined();
      expect(result.antonyms).toBeUndefined();
    });

    it('should handle response with missing meanings property', () => {
      const mockApiResponse = {
        word: 'test',
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.partsOfSpeech).toBeUndefined();
      expect(result.examples).toBeUndefined();
      expect(result.synonyms).toBeUndefined();
      expect(result.antonyms).toBeUndefined();
    });

    it('should handle response with empty definitions', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.partsOfSpeech).toHaveLength(1);
      expect(result.partsOfSpeech![0].type).toBe('noun');
      expect(result.partsOfSpeech![0].definitions).toHaveLength(0);
    });

    it('should handle response with missing definitions property', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            partOfSpeech: 'noun',
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.partsOfSpeech).toBeUndefined();
    });

    it('should handle response with definition without text', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            definitions: [
              {
                // Missing definition text
                example: 'This is an example.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.examples).toBeUndefined();
    });

    it('should handle response with empty definition text', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            definitions: [
              {
                definition: '',
                example: 'This is an example.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(0);
      expect(result.examples).toBeUndefined();
    });

    it('should handle response with whitespace-only definition text', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            definitions: [
              {
                definition: '   ',
                example: 'This is an example.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe('   ');
      expect(result.examples).toEqual(['This is an example.']);
      // Note: The implementation doesn't filter out whitespace-only definitions
      // This test documents the current behavior
    });

    it('should deduplicate synonyms and antonyms', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            synonyms: ['same', 'identical', 'same'], // Duplicate
            antonyms: ['different', 'opposite', 'different'], // Duplicate
            definitions: [
              {
                definition: 'A test definition.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.synonyms).toEqual(['same', 'identical']);
      expect(result.antonyms).toEqual(['different', 'opposite']);
    });

    it('should handle non-array synonyms and antonyms', () => {
      const mockApiResponse = {
        word: 'test',
        meanings: [
          {
            synonyms: 'not-an-array',
            antonyms: null,
            definitions: [
              {
                definition: 'A test definition.',
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.synonyms).toBeUndefined();
      expect(result.antonyms).toBeUndefined();
    });

    it('should throw error for invalid response format', () => {
      expect(() => transformer.transformLexicalaResponse(null)).toThrow(
        'Invalid Lexicala API response format'
      );
      expect(() => transformer.transformLexicalaResponse(undefined)).toThrow(
        'Invalid Lexicala API response format'
      );
      expect(() => transformer.transformLexicalaResponse('string')).toThrow(
        'Invalid Lexicala API response format'
      );
      expect(() => transformer.transformLexicalaResponse(123)).toThrow(
        'Invalid Lexicala API response format'
      );
    });

    it('should estimate frequency correctly for different word types', () => {
      // Short word with many definitions (common)
      const shortWordResponse = {
        word: 'cat',
        meanings: Array(5).fill({
          definitions: [{ definition: 'A definition.' }],
        }),
      };

      const shortWordResult =
        transformer.transformLexicalaResponse(shortWordResponse);
      expect(shortWordResult.frequency!.level).toBe('common');
      expect(shortWordResult.frequency!.frequency).toBe(0.8);

      // Medium word with many definitions (common)
      const mediumWordResponse = {
        word: 'hello',
        meanings: Array(4).fill({
          definitions: [{ definition: 'A definition.' }],
        }),
      };

      const mediumWordResult =
        transformer.transformLexicalaResponse(mediumWordResponse);
      expect(mediumWordResult.frequency!.level).toBe('common');
      expect(mediumWordResult.frequency!.frequency).toBe(0.6);

      // Long word (uncommon)
      const longWordResponse = {
        word: 'supercalifragilisticexpialidocious',
        meanings: [
          {
            definitions: [{ definition: 'A definition.' }],
          },
        ],
      };

      const longWordResult =
        transformer.transformLexicalaResponse(longWordResponse);
      expect(longWordResult.frequency!.level).toBe('uncommon');
      expect(longWordResult.frequency!.frequency).toBe(0.3);

      // Default case
      const defaultWordResponse = {
        word: 'test',
        meanings: [
          {
            definitions: [{ definition: 'A definition.' }],
          },
        ],
      };

      const defaultWordResult =
        transformer.transformLexicalaResponse(defaultWordResponse);
      expect(defaultWordResult.frequency!.level).toBe('common');
      expect(defaultWordResult.frequency!.frequency).toBe(0.5);
    });
  });

  describe('validateWordData', () => {
    it('should validate correct DictionaryWord data', () => {
      const validWord: DictionaryWord = {
        word: 'hello',
        definitions: [
          {
            definition: 'A greeting.',
          },
        ],
        source: 'Lexicala API',
        lastUpdated: new Date().toISOString(),
      };

      expect(transformer.validateWordData(validWord)).toBe(true);
    });

    it('should reject invalid data types', () => {
      expect(transformer.validateWordData(null)).toBe(false);
      expect(transformer.validateWordData(undefined)).toBe(false);
      expect(transformer.validateWordData('string')).toBe(false);
      expect(transformer.validateWordData(123)).toBe(false);
      expect(transformer.validateWordData([])).toBe(false);
    });

    it('should reject data without word property', () => {
      const invalidWord = {
        definitions: [{ definition: 'A greeting.' }],
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should reject data with empty word', () => {
      const invalidWord = {
        word: '',
        definitions: [{ definition: 'A greeting.' }],
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should reject data with whitespace-only word', () => {
      const invalidWord = {
        word: '   ',
        definitions: [{ definition: 'A greeting.' }],
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should reject data without definitions array', () => {
      const invalidWord = {
        word: 'hello',
        definitions: 'not-an-array',
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should accept data with empty definitions array', () => {
      const validWord = {
        word: 'hello',
        definitions: [],
      };

      expect(transformer.validateWordData(validWord)).toBe(true);
    });

    it('should reject data with invalid definition objects', () => {
      const invalidWord = {
        word: 'hello',
        definitions: [
          {
            definition: '', // Empty definition
          },
        ],
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should reject data with whitespace-only definition', () => {
      const invalidWord = {
        word: 'hello',
        definitions: [
          {
            definition: '   ', // Whitespace-only definition
          },
        ],
      };

      expect(transformer.validateWordData(invalidWord)).toBe(false);
    });

    it('should accept data with valid definitions and optional properties', () => {
      const validWord: DictionaryWord = {
        word: 'hello',
        phonetic: 'həˈloʊ',
        definitions: [
          {
            definition: 'A greeting.',
            partOfSpeech: 'noun',
            examples: ['Hello, world!'],
          },
        ],
        partsOfSpeech: [
          {
            type: 'noun',
            definitions: [{ definition: 'A greeting.' }],
          },
        ],
        etymology: 'From Old English',
        examples: ['Hello, world!'],
        synonyms: ['greeting'],
        antonyms: ['goodbye'],
        frequency: { level: 'common', frequency: 0.8 },
        source: 'Lexicala API',
        lastUpdated: new Date().toISOString(),
      };

      expect(transformer.validateWordData(validWord)).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should transform and validate data correctly', () => {
      const mockApiResponse = {
        word: 'hello',
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'A greeting.',
                example: 'Hello, world!',
              },
            ],
          },
        ],
      };

      const transformed =
        transformer.transformLexicalaResponse(mockApiResponse);
      const isValid = transformer.validateWordData(transformed);

      expect(isValid).toBe(true);
      expect(transformed.word).toBe('hello');
      expect(transformed.definitions).toHaveLength(1);
      expect(transformed.definitions[0].definition).toBe('A greeting.');
    });

    it('should handle complex nested data structures', () => {
      const complexResponse = {
        word: 'complex',
        phonetic: 'kəmˈpleks',
        meanings: [
          {
            partOfSpeech: 'adjective',
            definitions: [
              {
                definition: 'Consisting of many different and connected parts.',
                example: 'A complex system.',
                context: 'technical',
              },
              {
                definition: 'Not easy to analyze or understand.',
                example: 'A complex problem.',
              },
            ],
            synonyms: ['complicated', 'intricate', 'sophisticated'],
            antonyms: ['simple', 'basic'],
          },
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'A group of similar buildings.',
                example: 'An apartment complex.',
              },
            ],
            synonyms: ['building', 'structure'],
          },
        ],
        etymology: 'From Latin complexus.',
      };

      const result = transformer.transformLexicalaResponse(complexResponse);

      expect(result.word).toBe('complex');
      expect(result.phonetic).toBe('kəmˈpleks');
      expect(result.etymology).toBe('From Latin complexus.');
      expect(result.definitions).toHaveLength(3);
      expect(result.partsOfSpeech).toHaveLength(2);
      expect(result.synonyms).toEqual([
        'complicated',
        'intricate',
        'sophisticated',
        'building',
        'structure',
      ]);
      expect(result.antonyms).toEqual(['simple', 'basic']);
      expect(result.examples).toEqual([
        'A complex system.',
        'A complex problem.',
        'An apartment complex.',
      ]);
    });
  });
});
