import { useState, useCallback } from 'react';
import { DictionaryWord, TranslationWord } from '../types/dictionary';

export interface LexicalCollectionsState {
  translationByFromWord: Map<string, TranslationWord>;
  translationByLemma: Map<string, TranslationWord[]>;
  dictionaryByLemma: Map<string, DictionaryWord>;
}

function normalizeKey(key: string): string {
  return key.normalize('NFC').toLowerCase().trim();
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

  const reset = useCallback(() => {
    setByFromWord(new Map());
    setByLemma(new Map());
    setDictByLemma(new Map());
  }, []);

  const hydrate = useCallback(
    (translations: TranslationWord[], dictionary: DictionaryWord[]) => {
      const byFrom = new Map<string, TranslationWord>();
      const byLemma = new Map<string, TranslationWord[]>();
      const dict = new Map<string, DictionaryWord>();

      for (const d of dictionary) {
        dict.set(normalizeKey(d.lemma), d);
      }

      for (const t of translations) {
        const fromKey = normalizeKey(t.fromWord);
        const lemmaKey = normalizeKey(t.lemma);
        byFrom.set(fromKey, t);
        const arr = byLemma.get(lemmaKey) ?? [];
        arr.push(t);
        byLemma.set(lemmaKey, arr);
      }

      setByFromWord(byFrom);
      setByLemma(byLemma);
      setDictByLemma(dict);
    },
    []
  );

  return {
    translationByFromWord,
    translationByLemma,
    dictionaryByLemma,
    hydrate,
    reset,
  } satisfies LexicalCollectionsState & {
    hydrate: (t: TranslationWord[], d: DictionaryWord[]) => void;
    reset: () => void;
  };
}
