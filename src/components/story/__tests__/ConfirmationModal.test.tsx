import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from '../ConfirmationModal';
import { TooltipProvider } from '../../ui/Tooltip';

// Tests in this file were added by the assistant.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'storyInput.confirmationModal.title': 'Confirm Translation Options',
        'storyInput.confirmationModal.from': 'From',
        'storyInput.confirmationModal.to': 'To',
        'storyInput.confirmationModal.difficulty': 'Difficulty',
        'storyInput.confirmationModal.vocabulary': 'Vocabulary',
        'storyInput.confirmationModal.editLanguage': 'Edit language',
        'storyInput.confirmationModal.clickToChangeLanguage':
          'Click to change language',
        'storyInput.confirmationModal.editDifficulty': 'Edit difficulty',
        'storyInput.confirmationModal.clickToChangeDifficulty':
          'Click to change difficulty',
        'storyInput.confirmationModal.noVocabularySelected':
          'No vocabulary selected',
        'storyInput.confirmationModal.goToVocabulary': 'Choose vocabulary',
        'storyInput.confirmationModal.clickToChangeVocabulary':
          'Click to change vocabulary',
        'storyInput.confirmationModal.vocabularySelectedCount': `${(vars?.count as number) ?? 0} selected`,
        'storyInput.confirmationModal.cancel': 'Cancel',
        'storyInput.confirmationModal.confirm': 'Confirm',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

describe('ConfirmationModal', () => {
  it('renders content and triggers callbacks', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const onGoTo = vi.fn();
    const getLanguageName = vi.fn((code: string) =>
      code === 'es' ? 'Spanish' : 'English'
    );
    const getDifficultyLabel = vi.fn(() => 'A1 (Beginner)');

    render(
      <TooltipProvider>
        <ConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          fromLanguage={'es'}
          toLanguage={'en'}
          difficulty={'a1'}
          selectedVocabulary={['apple', 'banana']}
          getLanguageName={getLanguageName}
          getDifficultyLabel={getDifficultyLabel}
          onGoToOptionsSection={onGoTo}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Confirm Translation Options')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
