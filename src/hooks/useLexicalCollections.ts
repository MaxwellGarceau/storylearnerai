import { useState, useCallback } from 'react';
import { DictionaryWord, TranslationWord } from '../types/dictionary';

export interface LexicalCollectionsState {
  translationByFromWord: Map<string, TranslationWord>;
  translationByLemma: Map<string, TranslationWord[]>;
  dictionaryByLemma: Map<string, DictionaryWord>;
  lemmaByFromWord: Map<string, string>;
  lemmaByTargetWord: Map<string, string>;
}

function normalizeKey(key: string): string {
  return key.normalize('NFC').toLowerCase().trim();
}

function sanitizeToken(token: string): string {
  return token
    .normalize('NFC')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .trim();
}

export function useLexicalCollections() {
  const [translationByFromWord, setByFromWord] = useState(
    () => new Map<string, TranslationWord>()
  );
  const [translationByLemma, setByLemma] = useState(
    () => new Map<string, TranslationWord[]>()
  );
  const [dictionaryByLemma, setDictByLemma] = useState(
    () => new Map<string, DictionaryWord>()
  );
  const [lemmaByFromWord, setLemmaByFromWord] = useState(
    () => new Map<string, string>()
  );
  const [lemmaByTargetWord, setLemmaByTargetWord] = useState(
    () => new Map<string, string>()
  );

  const reset = useCallback(() => {
    setByFromWord(new Map());
    setByLemma(new Map());
    setDictByLemma(new Map());
    setLemmaByFromWord(new Map());
    setLemmaByTargetWord(new Map());
  }, []);

  const hydrate = useCallback(
    (translations: TranslationWord[], dictionary: DictionaryWord[]) => {
      const byFrom = new Map<string, TranslationWord>();
      const byLemma = new Map<string, TranslationWord[]>();
      const dict = new Map<string, DictionaryWord>();
      const byFromLemma = new Map<string, string>();
      const byTargetLemma = new Map<string, string>();

      for (const d of dictionary) {
        dict.set(normalizeKey(d.lemma), d);
      }

      for (const t of translations) {
        const fromKey = normalizeKey(sanitizeToken(t.fromWord));
        const lemmaKey = normalizeKey(t.lemma);
        const targetKey = normalizeKey(sanitizeToken(t.targetWord));
        byFrom.set(fromKey, t);
        byFromLemma.set(fromKey, lemmaKey);
        if (targetKey) {
          byTargetLemma.set(targetKey, lemmaKey);
        }
        const arr = byLemma.get(lemmaKey) ?? [];
        arr.push(t);
        byLemma.set(lemmaKey, arr);
      }

      setByFromWord(byFrom);
      setByLemma(byLemma);
      setDictByLemma(dict);
      setLemmaByFromWord(byFromLemma);
      setLemmaByTargetWord(byTargetLemma);
    },
    []
  );

  return {
    translationByFromWord,
    translationByLemma,
    dictionaryByLemma,
    lemmaByFromWord,
    lemmaByTargetWord,
    hydrate,
    reset,
  } satisfies LexicalCollectionsState & {
    hydrate: (t: TranslationWord[], d: DictionaryWord[]) => void;
    reset: () => void;
  };
}
