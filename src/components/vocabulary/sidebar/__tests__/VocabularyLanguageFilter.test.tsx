import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

import { VocabularyLanguageFilter } from '../VocabularyLanguageFilter';

const languages = [
  { id: 1, code: 'en', name: 'English' },
  { id: 2, code: 'es', name: 'Spanish' },
];

describe('VocabularyLanguageFilter', () => {
  it('toggles filter visibility', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <VocabularyLanguageFilter
        show={false}
        onToggle={onToggle}
        selectedLanguageId={null}
        onChange={() => {}}
        languages={languages}
      />
    );

    const toggleBtn = screen.getByRole('button', {
      name: /vocabulary\.filters\.title/i,
    });
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);

    // show contents when show is true
    rerender(
      <VocabularyLanguageFilter
        show={true}
        onToggle={onToggle}
        selectedLanguageId={null}
        onChange={() => {}}
        languages={languages}
      />
    );
    expect(screen.getByText('vocabulary.filters.language')).toBeInTheDocument();
  });

  it('emits onChange with selected language id', () => {
    const onChange = vi.fn();
    render(
      <VocabularyLanguageFilter
        show={true}
        onToggle={() => {}}
        selectedLanguageId={null}
        onChange={onChange}
        languages={languages}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
