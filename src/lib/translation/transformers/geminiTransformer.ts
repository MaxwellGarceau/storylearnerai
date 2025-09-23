import { TranslationWord } from '../../../types/dictionary';
import { logger } from '../../logger';

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeSurface(text: string): string {
  return text.normalize('NFC').trim();
}

export class GeminiTranslationTransformer {
  validateAndNormalize(input: unknown[]): TranslationWord[] {
    if (!Array.isArray(input)) {
      logger.error(
        'translation',
        'Gemini translations payload is not an array'
      );
      throw new Error('Invalid translations payload');
    }

    const results: TranslationWord[] = [];
    input.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        logger.warn(
          'translation',
          'Skipping invalid translation item: not an object',
          { index }
        );
        return;
      }
      const raw = item as Partial<TranslationWord> & { confidence?: unknown };

      const id =
        typeof raw.id === 'string' && raw.id
          ? raw.id
          : (crypto.randomUUID?.() ?? `gen-${index}`);
      if (!isUuidLike(id)) {
        // not fatal; keep generated id
      }

      if (typeof raw.fromWord !== 'string' || raw.fromWord.trim() === '') {
        logger.warn('translation', 'Skipping item with missing fromWord', {
          index,
        });
        return;
      }
      if (typeof raw.targetWord !== 'string' || raw.targetWord.trim() === '') {
        logger.warn('translation', 'Skipping item with missing targetWord', {
          index,
        });
        return;
      }
      if (typeof raw.lemma !== 'string' || raw.lemma.trim() === '') {
        logger.warn('translation', 'Skipping item with missing lemma', {
          index,
        });
        return;
      }

      let confidence: number | undefined = undefined;
      if (raw.confidence !== undefined) {
        const c = Number(raw.confidence);
        if (!Number.isNaN(c) && c >= 0 && c <= 1) {
          confidence = c;
        } else {
          logger.warn('translation', 'Dropping invalid confidence value', {
            index,
            value: raw.confidence,
          });
        }
      }

      const normalized: TranslationWord = {
        id,
        fromWord: normalizeSurface(raw.fromWord),
        targetWord: normalizeSurface(raw.targetWord),
        lemma: normalizeSurface(raw.lemma),
        confidence,
        translation_meta: raw.translation_meta ?? {},
      };

      // Filter out punctuation-only tokens AFTER normalization
      if (/^[\p{P}\p{S}]+$/u.test(normalized.fromWord)) {
        return;
      }

      results.push(normalized);
    });

    if (results.length === 0) {
      throw new Error('No valid translation items found');
    }

    return results;
  }
}
