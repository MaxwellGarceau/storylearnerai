import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

import { VocabularySidebarHeader } from '../VocabularySidebarHeader';

describe('VocabularySidebarHeader', () => {
  it('shows title, count badge, and add button', () => {
    const onAdd = vi.fn();
    render(<VocabularySidebarHeader count={3} onAdd={onAdd} />);

    expect(screen.getByText('vocabulary.title')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
