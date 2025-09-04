import React from 'react';
import { render } from '@testing-library/react';
import Content from '../Content';
import Root from '../Root';
import type { DictionaryWord } from '../../../../types/dictionary';

const renderWithRoot = (
  ui: React.ReactNode,
  {
    word = 'alpha',
    wordInfo = null,
    isLoading = false,
    error = null,
  }: {
    word?: string;
    wordInfo?: DictionaryWord | null;
    isLoading?: boolean;
    error?: Error | null;
  } = {}
) => {
  return render(
    <Root word={word} wordInfo={wordInfo ?? null} isLoading={isLoading} error={error}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.Content', () => {
  const validWordInfo: DictionaryWord = {
    word: 'alpha',
    definitions: [{ definition: 'first', partOfSpeech: 'adjective' }],
  };

  it('renders LoadingMessage when loading', () => {
    const { getByText } = renderWithRoot(<Content />, {
      isLoading: true,
    });

    expect(getByText('Loading dictionary info...')).toBeInTheDocument();
  });

  it('renders ErrorMessage when error', () => {
    const { getByText } = renderWithRoot(<Content />, {
      error: new Error('boom'),
    });

    expect(getByText('Failed to load dictionary info')).toBeInTheDocument();
  });

  it('renders default composed children when wordInfo present', () => {
    const { getByText } = renderWithRoot(<Content />, {
      wordInfo: validWordInfo,
    });

    // Header shows the word
    expect(getByText('alpha')).toBeInTheDocument();
    // Definition shows enumerated index "1."
    expect(getByText('1.')).toBeInTheDocument();
  });

  it('renders provided children when passed', () => {
    const { getByText, queryByText } = renderWithRoot(
      <Content>
        <div>Custom content</div>
      </Content>,
      { wordInfo: validWordInfo }
    );

    expect(getByText('Custom content')).toBeInTheDocument();
    // Should not render the default Definition index when custom children are provided
    expect(queryByText('1.')).toBeNull();
  });

  it('renders DefaultMessage when idle and no wordInfo', () => {
    const { getByText } = renderWithRoot(<Content />, {});
    expect(getByText('Hover to see dictionary info')).toBeInTheDocument();
  });
});


