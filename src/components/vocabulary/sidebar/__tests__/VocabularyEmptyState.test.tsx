import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useLocalization to return the key directly
vi.mock('../../../../hooks/useLocalization', () => ({
  useLocalization: () => ({ t: (k: string) => k }),
}));

import { VocabularyEmptyState } from '../VocabularyEmptyState';

describe('VocabularyEmptyState', () => {
  it('renders empty sidebar message by default', () => {
    render(<VocabularyEmptyState showNoResults={false} />);
    expect(screen.getByText('vocabulary.empty.sidebar')).toBeInTheDocument();
  });

  it('renders no results message when showNoResults is true', () => {
    render(<VocabularyEmptyState showNoResults={true} />);
    expect(screen.getByText('vocabulary.noResults')).toBeInTheDocument();
  });
});
