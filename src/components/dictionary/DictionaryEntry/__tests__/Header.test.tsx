import React from 'react';
import { render } from '@testing-library/react';
import Header from '../Header';
import Root from '../Root';
import type { DictionaryWord } from '../../../../types/dictionary';

const wrap = (
  ui: React.ReactNode,
  wordInfo: DictionaryWord | null,
  opts: { word?: string; showPhonetic?: boolean; showFrequency?: boolean } = {}
) => {
  const { word = 'delta' } = opts;
  return render(
    <Root word={word} wordInfo={wordInfo} isLoading={false} error={null}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.Header', () => {
  const info: DictionaryWord = {
    word: 'delta',
    phonetic: 'ˈdɛltə',
    definitions: [{ definition: 'fourth letter', partOfSpeech: 'noun' }],
    frequency: { level: 'common' },
  };

  it('renders plain word when no wordInfo', () => {
    const { getByText } = wrap(<Header />, null, { word: 'plain' });
    expect(getByText('plain')).toBeInTheDocument();
  });

  it('renders word from wordInfo when available', () => {
    const { getByText } = wrap(<Header />, info);
    expect(getByText('delta')).toBeInTheDocument();
  });

  it('shows phonetic when present and enabled', () => {
    const { getByText } = wrap(<Header showPhonetic />, info);
    expect(getByText('[ˈdɛltə]')).toBeInTheDocument();
  });

  it('hides phonetic when disabled', () => {
    const { queryByText } = wrap(<Header showPhonetic={false} />, info);
    expect(queryByText('[ˈdɛltə]')).toBeNull();
  });

  it('shows frequency badge when present and enabled', () => {
    const { getByText } = wrap(<Header showFrequency />, info);
    expect(getByText('common')).toBeInTheDocument();
  });

  it('hides frequency when disabled', () => {
    const { queryByText } = wrap(<Header showFrequency={false} />, info);
    expect(queryByText('common')).toBeNull();
  });
});


