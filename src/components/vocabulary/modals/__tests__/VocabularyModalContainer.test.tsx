import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VocabularyModalContainer } from '../VocabularyModalContainer';

describe('VocabularyModalContainer', () => {
  it('renders children in overlay container', () => {
    render(
      <VocabularyModalContainer>
        <div>inside</div>
      </VocabularyModalContainer>
    );
    expect(screen.getByText('inside')).toBeInTheDocument();
  });
});
