import { describe, it, expect } from 'vitest';
import { LexicalaDataTransformerImpl } from '../lexicalaTransformer';
import { LexicalaApiResponse } from '../../../../types/dictionary';

describe('LexicalaDataTransformerImpl', () => {
  let transformer: LexicalaDataTransformerImpl;

  beforeEach(() => {
    transformer = new LexicalaDataTransformerImpl();
  });

  describe('transformLexicalaResponse', () => {
    it('should transform actual Lexicala API response structure', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 1,
        page_number: 1,
        results_per_page: 10,
        n_pages: 1,
        available_n_pages: 1,
        results: [
          {
            id: 'EN_DE2d686591a3f3',
            source: 'global',
            language: 'en',
            version: 1,
            frequency: '215629',
            headword: {
              text: 'straw',
              pronunciation: {
                value: 'strɔ',
              },
              pos: 'noun',
            },
            senses: [
              {
                id: 'EN_SEc21dc4afd439',
                definition: 'dried stems of some crops used to feed animals',
                examples: [
                  {
                    text: 'Feed the horse straw to reduce calories.',
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('straw');
      expect(result.phonetic).toBe('strɔ');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe(
        'dried stems of some crops used to feed animals'
      );
      expect(result.examples).toEqual([
        'Feed the horse straw to reduce calories.',
      ]);
      expect(result.frequency?.rank).toBe(215629);
      expect(result.source).toBe('Lexicala API');
      expect(result.lastUpdated).toBeDefined();
    });

    it('should handle response with direct definitions', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 1,
        page_number: 1,
        results_per_page: 10,
        n_pages: 1,
        available_n_pages: 1,
        results: [
          {
            id: 'EN_DE2d686591a3f3',
            language: 'en',
            headword: {
              text: 'hello',
            },
            senses: [
              {
                id: 'EN_SEc21dc4afd439',
                definition: 'A greeting or an expression of goodwill.',
                partOfSpeech: 'noun',
                examples: [
                  {
                    text: 'She gave me a warm hello.',
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('hello');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe(
        'A greeting or an expression of goodwill.'
      );
      expect(result.definitions[0].partOfSpeech).toBe('noun');
      expect(result.examples).toEqual(['She gave me a warm hello.']);
      expect(result.partsOfSpeech).toHaveLength(1);
      expect(result.partsOfSpeech?.[0]?.type).toBe('noun');
    });

    it('should handle response with synonyms and antonyms', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 1,
        page_number: 1,
        results_per_page: 10,
        n_pages: 1,
        available_n_pages: 1,
        results: [
          {
            id: 'EN_DE2d686591a3f3',
            language: 'en',
            headword: {
              text: 'happy',
            },
            senses: [
              {
                id: 'EN_SEc21dc4afd439',
                definition: 'Feeling or showing pleasure or contentment.',
                partOfSpeech: 'adjective',
                synonyms: ['joyful', 'cheerful', 'glad'],
                antonyms: ['sad', 'unhappy', 'miserable'],
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('happy');
      expect(result.synonyms).toEqual(['joyful', 'cheerful', 'glad']);
      expect(result.antonyms).toEqual(['sad', 'unhappy', 'miserable']);
    });

    it('should handle compositional phrases', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 1,
        page_number: 1,
        results_per_page: 10,
        n_pages: 1,
        available_n_pages: 1,
        results: [
          {
            id: 'EN_DE2d686591a3f3',
            language: 'en',
            headword: {
              text: 'straw',
            },
            senses: [
              {
                id: 'EN_SEc21dc4afd439',
                compositional_phrases: [
                  {
                    text: 'the last/final straw',
                    definition:
                      'the last of several bad things, that makes you unable to deal with the situation anymore',
                    examples: [
                      {
                        text: 'The new law was the final straw for many dairy farmers.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('straw');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe(
        'the last/final straw: the last of several bad things, that makes you unable to deal with the situation anymore'
      );
      expect(result.examples).toEqual([
        'The new law was the final straw for many dairy farmers.',
      ]);
    });

    it('should handle empty results array', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 0,
        page_number: 1,
        results_per_page: 10,
        n_pages: 0,
        available_n_pages: 0,
        results: [],
      };

      expect(() => {
        transformer.transformLexicalaResponse(mockApiResponse);
      }).toThrow('No results found in Lexicala API response');
    });

    it('should handle result with no senses', () => {
      const mockApiResponse: LexicalaApiResponse = {
        n_results: 1,
        page_number: 1,
        results_per_page: 10,
        n_pages: 1,
        available_n_pages: 1,
        results: [
          {
            id: 'EN_DE2d686591a3f3',
            language: 'en',
            headword: {
              text: 'test',
            },
            senses: [],
          },
        ],
      };

      const result = transformer.transformLexicalaResponse(mockApiResponse);

      expect(result.word).toBe('test');
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].definition).toBe('Word: test');
    });

    it('should handle invalid input', () => {
      expect(() => {
        transformer.transformLexicalaResponse(null);
      }).toThrow('Invalid Lexicala API response format');

      expect(() => {
        transformer.transformLexicalaResponse('invalid');
      }).toThrow('Invalid Lexicala API response format');
    });
  });

  describe('validateWordData', () => {
    it('should validate correct DictionaryWord data', () => {
      const validWord = {
        word: 'test',
        definitions: [
          {
            definition: 'A test definition',
          },
        ],
      };

      expect(transformer.validateWordData(validWord)).toBe(true);
    });

    it('should reject invalid DictionaryWord data', () => {
      expect(transformer.validateWordData(null)).toBe(false);
      expect(transformer.validateWordData({})).toBe(false);
      expect(transformer.validateWordData({ word: '' })).toBe(false);
      expect(transformer.validateWordData({ word: 'test' })).toBe(false);
      expect(
        transformer.validateWordData({
          word: 'test',
          definitions: [],
        })
      ).toBe(false);
      expect(
        transformer.validateWordData({
          word: 'test',
          definitions: [{ definition: '' }],
        })
      ).toBe(false);
    });
  });
});
