import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import OptionsModal from '../OptionsModal';
import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';

// Tests in this file were added by the assistant.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'storyInput.optionsModal.title': 'Translation Options',
        'storyInput.optionsModal.languageLabel': 'Language',
        'storyInput.optionsModal.difficultyLabel': 'Difficulty',
        'storyInput.optionsModal.vocabularyTitle': 'Learner Vocabulary',
        'storyInput.done': 'Done',
        'storyInput.optionsModal.a1': 'A1 (Beginner)',
        'storyInput.optionsModal.a2': 'A2 (Elementary)',
        'storyInput.optionsModal.b1': 'B1 (Intermediate)',
        'storyInput.optionsModal.b2': 'B2 (Upper Intermediate)',
        'storyInput.currentlySupported': 'Only English is supported',
        'storyInput.difficultyDescription': 'Adapted',
        'storyInput.optionsModal.vocabularySubtitle': 'Select words',
        'storyInput.optionsModal.noVocabularyForPair':
          'No vocabulary available',
        'common.loading': 'Loading…',
        'storyInput.optionsModal.selectedCount': '0',
      };
      return map[key] ?? key;
    },
  }),
}));

const makeVocab = (
  id: number,
  from: string,
  target: string
): VocabularyWithLanguages => ({
  id,
  user_id: 'u1',
  from_word: from,
  target_word: target,
  from_language_id: 1,
  target_language_id: 2,
  from_word_context: null,
  target_word_context: null,
  definition: null,
  part_of_speech: null,
  frequency_level: null,
  saved_translation_id: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  from_language: { id: 1, code: 'es', name: 'Spanish', native_name: 'Español' },
  target_language: {
    id: 2,
    code: 'en',
    name: 'English',
    native_name: 'English',
  },
});

describe('OptionsModal', () => {
  it('renders sections and allows closing', () => {
    const onClose = vi.fn();
    const onLanguageChange = vi.fn();
    const onDifficultyChange = vi.fn();
    const onVocabularyChange = vi.fn();
    const getLanguageName = vi.fn().mockReturnValue('English');

    render(
      <OptionsModal
        isOpen={true}
        onClose={onClose}
        selectedLanguage={'en'}
        onLanguageChange={onLanguageChange}
        selectedDifficulty={'a1'}
        onDifficultyChange={onDifficultyChange}
        availableVocabulary={[makeVocab(1, 'hola', 'hello')]}
        selectedVocabulary={[]}
        onVocabularyChange={onVocabularyChange}
        vocabLoading={false}
        getLanguageName={getLanguageName}
      />
    );

    expect(screen.getByText('Translation Options')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Learner Vocabulary')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });
});
