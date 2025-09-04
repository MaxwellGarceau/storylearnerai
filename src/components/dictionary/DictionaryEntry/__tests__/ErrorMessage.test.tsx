import React from 'react';
import { render } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';
import Root from '../Root';
import { DictionaryError } from '../../../../types/dictionary';

const renderWithRoot = (
  error: Error | null,
  word = 'gamma',
  ui: React.ReactNode = <ErrorMessage />
) => {
  return render(
    <Root word={word} wordInfo={null} isLoading={false} error={error}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.ErrorMessage', () => {
  it('does not render when there is no error', () => {
    const { queryByText } = renderWithRoot(null);
    expect(queryByText('Failed to load dictionary info')).toBeNull();
  });

  it('shows default error message for generic Error', () => {
    const { getByText } = renderWithRoot(new Error('oops'));
    expect(getByText('Failed to load dictionary info')).toBeInTheDocument();
  });

  it('shows word-not-found message for WORD_NOT_FOUND', () => {
    const error = new DictionaryError('WORD_NOT_FOUND', 'not found');
    const { getByText } = renderWithRoot(error);
    expect(getByText('Word not found in dictionary')).toBeInTheDocument();
  });

  it('maps disabled service message to user-friendly copy', () => {
    const error = new Error('Dictionary service is disabled');
    const { getByText } = renderWithRoot(error);
    expect(getByText('Dictionary has been disabled')).toBeInTheDocument();
  });

  it('renders the word label before the message', () => {
    const { getByText } = renderWithRoot(new Error('oops'), 'shownWord');
    expect(getByText('shownWord')).toBeInTheDocument();
  });
});


