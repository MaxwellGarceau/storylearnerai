import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

import { VocabularySearchInput } from '../VocabularySearchInput';

describe('VocabularySearchInput', () => {
  it('renders placeholder and calls onChange', () => {
    const onChange = vi.fn();
    render(<VocabularySearchInput value='' onChange={onChange} />);

    const input = screen.getByPlaceholderText('vocabulary.search.placeholder');
    fireEvent.change(input, { target: { value: 'hola' } });
    expect(onChange).toHaveBeenCalledWith('hola');
  });
});
