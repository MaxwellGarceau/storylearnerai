import {
  LexicalaDataTransformer,
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
  WordFrequency,
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
      return this.transformLexicalaApiResponse(
        rawData as Record<string, unknown>
      );
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

    if (!Array.isArray(word.definitions)) {
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
    data: Record<string, unknown>
  ): DictionaryWord {
    const word = data.word as string;
    const phonetic = data.phonetic as string | undefined;
    const meanings = data.meanings as
      | Array<Record<string, unknown>>
      | undefined;
    const etymology = data.etymology as string | undefined;

    const definitions: WordDefinition[] = [];
    const partsOfSpeech: PartOfSpeech[] = [];
    const examples: string[] = [];
    const synonyms: string[] = [];
    const antonyms: string[] = [];

    // Process meanings (definitions and parts of speech)
    if (Array.isArray(meanings)) {
      meanings.forEach(meaning => {
        const partOfSpeech = meaning.partOfSpeech as string | undefined;
        const defs = meaning.definitions as
          | Array<Record<string, unknown>>
          | undefined;
        const syns = meaning.synonyms as string[] | undefined;
        const ants = meaning.antonyms as string[] | undefined;

        // Process definitions
        if (Array.isArray(defs)) {
          defs.forEach(def => {
            const definition = def.definition as string;
            const example = def.example as string | undefined;

            if (definition) {
              definitions.push({
                definition,
                partOfSpeech,
                examples: example ? [example] : undefined,
                context: def.context as string | undefined,
              });

              if (example) {
                examples.push(example);
              }
            }
          });
        }

        // Process part of speech
        if (partOfSpeech && Array.isArray(defs)) {
          partsOfSpeech.push({
            type: partOfSpeech,
            definitions: defs.map(def => ({
              definition: def.definition as string,
              examples: def.example ? [def.example as string] : undefined,
              context: def.context as string | undefined,
            })),
          });
        }

        // Collect synonyms and antonyms
        if (Array.isArray(syns)) {
          synonyms.push(...syns);
        }
        if (Array.isArray(ants)) {
          antonyms.push(...ants);
        }
      });
    }

    // Determine frequency level based on word characteristics
    const frequency = this.estimateFrequency(word, definitions.length);

    return {
      word,
      phonetic,
      definitions,
      partsOfSpeech: partsOfSpeech.length > 0 ? partsOfSpeech : undefined,
      etymology,
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
