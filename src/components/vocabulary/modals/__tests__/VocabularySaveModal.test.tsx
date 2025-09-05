import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

// Mock UpsertModal to capture props
vi.mock('../VocabularyUpsertModal', () => ({
  __esModule: true,
  default: (props: unknown) => (
    <div data-testid='upsert-modal' data-props={JSON.stringify(props)}>
      Upsert
    </div>
  ),
}));

import { VocabularySaveModal } from '../VocabularySaveModal';

describe('VocabularySaveModal', () => {
  it('renders UpsertModal in create mode with language ids', () => {
    render(
      <VocabularySaveModal
        onClose={() => {}}
        currentLanguageId={1}
        currentFromLanguageId={2}
        initialData={{ originalWord: 'hola', translatedWord: 'hello' }}
      />
    );

    const el = screen.getByTestId('upsert-modal');
    const props = JSON.parse(el.getAttribute('data-props') ?? '{}') as {
      mode: string;
      currentLanguageId: number;
      currentFromLanguageId: number;
      initialData: { originalWord: string; translatedWord: string };
    };
    expect(props.mode).toBe('create');
    expect(props.currentLanguageId).toBe(1);
    expect(props.currentFromLanguageId).toBe(2);
    expect(props.initialData.originalWord).toBe('hola');
  });
});
