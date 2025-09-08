import React from 'react';
import { useTranslation } from 'react-i18next';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';

interface VocabularySelectorProps {
  availableVocabulary: VocabularyWithLanguages[];
  selectedVocabulary: string[];
  onVocabularyChange: (vocabulary: string[]) => void;
  vocabLoading: boolean;
}

const VocabularySelector: React.FC<VocabularySelectorProps> = ({
  availableVocabulary,
  selectedVocabulary,
  onVocabularyChange,
  vocabLoading,
}) => {
  const { t } = useTranslation();

  const isSelected = (word: string) =>
    Array.isArray(selectedVocabulary) && selectedVocabulary.includes(word);

  const toggleSelected = (word: string) => {
    const current = new Set(selectedVocabulary ?? []);
    if (current.has(word)) {
      current.delete(word);
    } else {
      current.add(word);
    }
    onVocabularyChange(Array.from(current));
  };

  return (
    <div className='space-y-2' data-vocabulary-section>
      <label className='text-sm font-medium'>
        {t('storyInput.optionsModal.vocabularyTitle')}
      </label>
      <p className='text-xs text-muted-foreground'>
        {t('storyInput.optionsModal.vocabularySubtitle')}
      </p>
      <div className='mt-2 max-h-48 overflow-auto border rounded-md p-2 bg-background'>
        {vocabLoading ? (
          <div className='text-sm text-muted-foreground'>
            {t('common.loading')}
          </div>
        ) : availableVocabulary.length === 0 ? (
          <div className='text-sm text-muted-foreground'>
            {t('storyInput.optionsModal.noVocabularyForPair')}
          </div>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {availableVocabulary.map(v => {
              // Display format: "source_word → target_word" but store only TARGET WORD
              const display = `${v.original_word} → ${v.translated_word}`;
              const key = `${v.id}-${v.translated_word}`;
              const selected = isSelected(v.translated_word); // Check target word selection
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => toggleSelected(v.translated_word)}
                  className={`text-sm px-2 py-1 rounded-md border transition-colors ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-input'
                  }`}
                  aria-pressed={selected}
                >
                  {display}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className='text-xs text-muted-foreground'>
        {t('storyInput.optionsModal.selectedCount', {
          count: selectedVocabulary?.length ?? 0,
        })}
      </div>
    </div>
  );
};

export default VocabularySelector;
