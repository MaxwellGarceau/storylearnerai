import {
  LexicalaDataTransformer,
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
  WordFrequency,
  LexicalaApiResponse,
  LexicalaResult,
} from '../../../types/dictionary';

/**
 * Data transformation layer for Lexicala API
 * Handles conversion from Lexicala API format to standardized DictionaryWord format
 */
export class LexicalaDataTransformerImpl implements LexicalaDataTransformer {
  /**
   * Transform raw Lexicala API response to DictionaryWord format
   */
  transformLexicalaResponse(rawData: unknown): DictionaryWord {
    if (typeof rawData === 'object' && rawData !== null) {
      return this.transformLexicalaApiResponse(rawData as LexicalaApiResponse);
    }

    throw new Error('Invalid Lexicala API response format');
  }

  /**
   * Validate if data conforms to DictionaryWord interface
   */
  validateWordData(data: unknown): data is DictionaryWord {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const word = data as DictionaryWord;

    // Check required fields
    if (typeof word.word !== 'string' || word.word.trim() === '') {
      return false;
    }

    if (!Array.isArray(word.definitions) || word.definitions.length === 0) {
      return false;
    }

    // Validate definitions
    for (const definition of word.definitions) {
      if (
        typeof definition.definition !== 'string' ||
        definition.definition.trim() === ''
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Transform Lexicala API response format
   * https://api.lexicala.com/
   */
  private transformLexicalaApiResponse(
    data: LexicalaApiResponse
  ): DictionaryWord {
    // Get the first result (most relevant)
    if (!data.results || data.results.length === 0) {
      throw new Error('No results found in Lexicala API response');
    }

    const firstResult = data.results[0];
    const word = firstResult.headword.text;
    
    const definitions: WordDefinition[] = [];
    const partsOfSpeech: PartOfSpeech[] = [];
    const examples: string[] = [];
    const synonyms: string[] = [];
    const antonyms: string[] = [];

    // Process senses (definitions and parts of speech)
    if (firstResult.senses && Array.isArray(firstResult.senses)) {
      firstResult.senses.forEach(sense => {
        // Handle "see" references (like "blew" -> "blow")
        if (sense.see) {
          definitions.push({
            definition: `See: ${sense.see}`,
            partOfSpeech: sense.partOfSpeech,
          });
        }

        // Handle direct definitions
        if (sense.definition) {
          definitions.push({
            definition: sense.definition,
            partOfSpeech: sense.partOfSpeech,
            examples: sense.examples,
          });

          // Collect examples
          if (sense.examples && Array.isArray(sense.examples)) {
            examples.push(...sense.examples);
          }
        }

        // Process part of speech
        if (sense.partOfSpeech && sense.definition) {
          partsOfSpeech.push({
            type: sense.partOfSpeech,
            definitions: [{
              definition: sense.definition,
              examples: sense.examples,
            }],
          });
        }

        // Collect synonyms and antonyms
        if (sense.synonyms && Array.isArray(sense.synonyms)) {
          synonyms.push(...sense.synonyms);
        }
        if (sense.antonyms && Array.isArray(sense.antonyms)) {
          antonyms.push(...sense.antonyms);
        }
      });
    }

    // If no definitions were found, create a basic one
    if (definitions.length === 0) {
      definitions.push({
        definition: `Word: ${word}`,
      });
    }

    // Determine frequency level based on word characteristics
    const frequency = this.estimateFrequency(word, definitions.length);

    return {
      word,
      definitions,
      partsOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : undefined,
      examples: examples.length > 0 ? examples : undefined,
      synonyms: synonyms.length > 0 ? [...new Set(synonyms)] : undefined,
      antonyms: antonyms.length > 0 ? [...new Set(antonyms)] : undefined,
      frequency,
      source: 'Lexicala API',
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Estimate word frequency based on word characteristics
   * This is a simple heuristic - in production, you'd use a proper frequency database
   */
  private estimateFrequency(
    word: string,
    definitionCount: number
  ): WordFrequency {
    const wordLength = word.length;
    const isShort = wordLength <= 4;
    const isMedium = wordLength <= 6;
    const hasManyDefinitions = definitionCount > 3;

    if (isShort && hasManyDefinitions) {
      return { level: 'common', frequency: 0.8 };
    } else if (isMedium && hasManyDefinitions) {
      return { level: 'common', frequency: 0.6 };
    } else if (wordLength > 8) {
      return { level: 'uncommon', frequency: 0.3 };
    } else {
      return { level: 'common', frequency: 0.5 };
    }
  }
}
