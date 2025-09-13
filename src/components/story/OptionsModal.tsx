import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';
import LanguageSelector from './LanguageSelector';
import DifficultySelector from './DifficultySelector';
import VocabularySelector from './VocabularySelector';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFromLanguage: LanguageCode;
  onFromLanguageChange: (language: LanguageCode) => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  availableVocabulary: VocabularyWithLanguages[];
  selectedVocabulary: string[];
  onVocabularyChange: (vocabulary: string[]) => void;
  vocabLoading: boolean;
  getLanguageName: (code: LanguageCode) => string;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  selectedFromLanguage,
  onFromLanguageChange,
  selectedLanguage,
  onLanguageChange,
  selectedDifficulty,
  onDifficultyChange,
  availableVocabulary,
  selectedVocabulary,
  onVocabularyChange,
  vocabLoading,
  getLanguageName,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg p-6 max-w-md w-full mx-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>
            {t('storyInput.optionsModal.title')}
          </h3>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='h-8 w-8 p-0'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='space-y-4'>
          <LanguageSelector
            selectedLanguage={selectedFromLanguage}
            onLanguageChange={onFromLanguageChange}
            getLanguageName={getLanguageName}
            labelKey='storyInput.optionsModal.fromLanguageLabel'
          />
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            getLanguageName={getLanguageName}
            labelKey='storyInput.optionsModal.languageLabel'
            excludeLanguage={selectedFromLanguage}
          />

          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={onDifficultyChange}
            getLanguageName={getLanguageName}
          />

          <VocabularySelector
            availableVocabulary={availableVocabulary}
            selectedVocabulary={selectedVocabulary}
            onVocabularyChange={onVocabularyChange}
            vocabLoading={vocabLoading}
          />
        </div>

        <div className='flex justify-end mt-6'>
          <Button onClick={onClose} className='px-6'>
            {t('storyInput.done')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OptionsModal;
