import {
  DictionaryWord,
  WordDefinition,
  PartOfSpeech,
} from '../../../types/dictionary';
import { logger } from '../../logger';

function toNfcLower(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

function isValidDefinition(def: unknown): def is WordDefinition {
  if (typeof def !== 'object' || def === null) return false;
  const d = def as WordDefinition;
  if (typeof d.definition !== 'string' || d.definition.trim() === '')
    return false;
  if (d.partOfSpeech !== undefined && typeof d.partOfSpeech !== 'string')
    return false;
  if (d.examples !== undefined && !Array.isArray(d.examples)) return false;
  return true;
}

function isValidPartsOfSpeech(pos: unknown): pos is PartOfSpeech[] {
  if (pos === undefined) return true;
  if (!Array.isArray(pos)) return false;
  return pos.every(
    p =>
      typeof p === 'object' &&
      p !== null &&
      typeof (p as PartOfSpeech).type === 'string'
  );
}

export class GeminiDictionaryTransformer {
  validateAndNormalize(input: unknown[]): DictionaryWord[] {
    if (!Array.isArray(input)) {
      logger.error('dictionary', 'Gemini dictionary payload is not an array');
      throw new Error('Invalid dictionary payload');
    }

    const results: DictionaryWord[] = [];
    for (const item of input) {
      if (typeof item !== 'object' || item === null) {
        logger.warn(
          'dictionary',
          'Skipping invalid dictionary item: not an object'
        );
        continue;
      }

      const raw = item as Partial<DictionaryWord> & { word?: string };
      // Accept either lemma or word as the canonical key; prefer lemma.
      const lemmaSource = raw.lemma ?? raw.word;
      if (typeof lemmaSource !== 'string' || lemmaSource.trim() === '') {
        logger.warn(
          'dictionary',
          'Skipping dictionary item with missing lemma'
        );
        continue;
      }

      const lemma = lemmaSource.normalize('NFC').trim();

      if (!Array.isArray(raw.definitions) || raw.definitions.length === 0) {
        logger.warn(
          'dictionary',
          'Skipping dictionary item with no definitions',
          { lemma }
        );
        continue;
      }
      if (!raw.definitions.every(isValidDefinition)) {
        logger.warn(
          'dictionary',
          'Skipping dictionary item with invalid definitions',
          { lemma }
        );
        continue;
      }
      if (!isValidPartsOfSpeech(raw.partsOfSpeech)) {
        logger.warn('dictionary', 'Dropping invalid partsOfSpeech', { lemma });
        delete (raw as { partsOfSpeech?: unknown }).partsOfSpeech;
      }

      const uniqueExamples = Array.from(
        new Set((raw.examples ?? []).map(e => String(e)))
      );
      const uniqueSynonyms = raw.synonyms
        ? Array.from(new Set(raw.synonyms))
        : undefined;
      const uniqueAntonyms = raw.antonyms
        ? Array.from(new Set(raw.antonyms))
        : undefined;

      const normalized: DictionaryWord = {
        lemma,
        phonetic: raw.phonetic?.trim(),
        definitions: raw.definitions as WordDefinition[],
        partsOfSpeech: raw.partsOfSpeech as PartOfSpeech[] | undefined,
        partsOfSpeechTags: raw.partsOfSpeechTags,
        etymology: raw.etymology?.trim(),
        examples: uniqueExamples.length > 0 ? uniqueExamples : undefined,
        synonyms: uniqueSynonyms,
        antonyms: uniqueAntonyms,
        frequency: raw.frequency,
        difficulty: raw.difficulty,
        audioUrl: raw.audioUrl,
        source: raw.source ?? 'Gemini',
      };

      results.push(normalized);
    }

    if (results.length === 0) {
      throw new Error('No valid dictionary items found');
    }

    return results;
  }
}
