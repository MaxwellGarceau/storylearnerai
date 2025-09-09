import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

vi.mock('../../../ui/ModalHeader', () => ({
  ModalHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('../../../../api/supabase/database/savedTranslationService', () => ({
  SavedTranslationService: class {
    getSavedTranslation() {
      return {
        id: 42,
        from_story: 'o',
        target_story: 't',
        difficulty_level: { code: 'a1' },
        from_language: { code: 'es' },
        target_language: { code: 'en' },
      };
    }
  },
}));

import { VocabularyDetailModal } from '../VocabularyDetailModal';
import type { VocabularyWithLanguages } from '../../../../types/database/vocabulary';

const vocab: VocabularyWithLanguages = {
  id: 1,
  from_word: 'hola',
  target_word: 'hello',
  from_language_id: 2,
  target_language_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  definition: 'greeting',
  part_of_speech: 'interjection',
  frequency_level: 'common',
  from_word_context: 'ctx1',
  target_word_context: 'ctx2',
  saved_translation_id: 42,
  from_language: { id: 2, code: 'es', name: 'Spanish' },
  target_language: { id: 1, code: 'en', name: 'English' },
};

describe('VocabularyDetailModal', () => {
  it('renders details and shows navigation button for saved translation', () => {
    render(
      <MemoryRouter>
        <VocabularyDetailModal vocabulary={vocab} _onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('vocabulary.detail.title')).toBeInTheDocument();
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(
      screen.getByText('vocabulary.detail.viewSavedTranslation')
    ).toBeInTheDocument();
  });
});
