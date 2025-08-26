import {
  LexicalaDataTransformer,
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
  WordFrequency,
  LexicalaApiResponse,
  LexicalaResult,
  LexicalaSense,
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
    const phonetic = firstResult.headword.pronunciation?.value;
    const partOfSpeech = firstResult.headword.pos;
    
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
          const exampleTexts = sense.examples?.map(ex => ex.text) || [];
          
          definitions.push({
            definition: sense.definition,
            partOfSpeech: sense.partOfSpeech,
            examples: exampleTexts.length > 0 ? exampleTexts : undefined,
          });

          // Collect examples
          if (sense.examples && Array.isArray(sense.examples)) {
            examples.push(...sense.examples.map(ex => ex.text));
          }
        }

        // Process part of speech
        if (sense.partOfSpeech && sense.definition) {
          const exampleTexts = sense.examples?.map(ex => ex.text) || [];
          
          partsOfSpeech.push({
            type: sense.partOfSpeech,
            definitions: [{
              definition: sense.definition,
              examples: exampleTexts.length > 0 ? exampleTexts : undefined,
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

        // Handle compositional phrases (idioms, expressions)
        if (sense.compositional_phrases && Array.isArray(sense.compositional_phrases)) {
          sense.compositional_phrases.forEach(phrase => {
            definitions.push({
              definition: `${phrase.text}: ${phrase.definition}`,
              partOfSpeech: sense.partOfSpeech,
              examples: phrase.examples?.map(ex => ex.text),
            });

            // Add phrase examples to overall examples
            if (phrase.examples && Array.isArray(phrase.examples)) {
              examples.push(...phrase.examples.map(ex => ex.text));
            }
          });
        }
      });
    }

    // If no definitions were found, create a basic one
    if (definitions.length === 0) {
      definitions.push({
        definition: `Word: ${word}`,
      });
    }

    // Determine frequency level based on API data or word characteristics
    const frequency = this.estimateFrequency(word, definitions.length, firstResult.frequency);

    return {
      word,
      phonetic,
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
   * Estimate word frequency based on word characteristics and API data
   * This is a simple heuristic - in production, you'd use a proper frequency database
   */
  private estimateFrequency(
    word: string,
    definitionCount: number,
    apiFrequency?: string
  ): WordFrequency {
    // If we have API frequency data, use it
    if (apiFrequency) {
      const frequencyNum = parseInt(apiFrequency, 10);
      if (!isNaN(frequencyNum)) {
        // Lower numbers = more frequent (rank-based)
        if (frequencyNum <= 1000) {
          return { level: 'common', frequency: 0.9, rank: frequencyNum };
        } else if (frequencyNum <= 10000) {
          return { level: 'common', frequency: 0.7, rank: frequencyNum };
        } else if (frequencyNum <= 50000) {
          return { level: 'uncommon', frequency: 0.5, rank: frequencyNum };
        } else {
          return { level: 'rare', frequency: 0.3, rank: frequencyNum };
        }
      }
    }

    // Fallback to heuristic-based estimation
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
