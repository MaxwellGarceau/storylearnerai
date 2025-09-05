import React from 'react';
import { render } from '@testing-library/react';
import DefaultMessage from '../DefaultMessage';
import LoadingMessage from '../LoadingMessage';
import Root from '../Root';

const renderWithRoot = (
  ui: React.ReactNode,
  {
    word = 'beta',
    isLoading = false,
    error = null,
  }: { word?: string; isLoading?: boolean; error?: Error | null } = {}
) => {
  return render(
    <Root word={word} wordInfo={null} isLoading={isLoading} error={error}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.DefaultMessage', () => {
  it('shows prompt when idle', () => {
    const { getByText } = renderWithRoot(<DefaultMessage />, {});
    expect(getByText('Hover to see dictionary info')).toBeInTheDocument();
  });

  it('does not render when loading', () => {
    const { queryByText } = renderWithRoot(<DefaultMessage />, {
      isLoading: true,
    });
    expect(queryByText('Hover to see dictionary info')).toBeNull();
  });

  it('does not render when error', () => {
    const { queryByText } = renderWithRoot(<DefaultMessage />, {
      error: new Error('failed'),
    });
    expect(queryByText('Hover to see dictionary info')).toBeNull();
  });
});

describe('DictionaryEntry.LoadingMessage', () => {
  it('renders only when loading', () => {
    const { getByText, rerender, queryByText } = renderWithRoot(
      <LoadingMessage />,
      { isLoading: true }
    );
    expect(getByText('Loading dictionary info...')).toBeInTheDocument();

    rerender(
      <Root word='beta' wordInfo={null} isLoading={false} error={null}>
        <LoadingMessage />
      </Root>
    );
    expect(queryByText('Loading dictionary info...')).toBeNull();
  });
});
