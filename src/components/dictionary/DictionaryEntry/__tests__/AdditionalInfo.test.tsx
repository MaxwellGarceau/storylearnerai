import React from 'react';
import { render } from '@testing-library/react';
import AdditionalInfo from '../AdditionalInfo';
import Root from '../Root';
import type { DictionaryWord } from '../../../../types/dictionary';

const wrap = (
  ui: React.ReactNode,
  wordInfo: DictionaryWord | null
) => {
  return render(
    <Root word='foxtrot' wordInfo={wordInfo} isLoading={false} error={null}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.AdditionalInfo', () => {
  const info: DictionaryWord = {
    word: 'foxtrot',
    definitions: [{ definition: 'a ballroom dance' }],
    synonyms: ['dance', 'step', 'movement', 'routine'],
    antonyms: ['stillness', 'rest'],
  };

  it('renders nothing when no wordInfo', () => {
    const { container } = wrap(<AdditionalInfo />, null);
    expect(container.textContent).toBe('');
  });

  it('renders synonyms up to maxSynonyms', () => {
    const { getByText } = wrap(<AdditionalInfo maxSynonyms={2} />, info);
    expect(getByText('Synonyms:')).toBeInTheDocument();
    expect(getByText('dance, step')).toBeInTheDocument();
  });

  it('renders antonyms up to maxAntonyms', () => {
    const { getByText } = wrap(<AdditionalInfo maxAntonyms={1} />, info);
    expect(getByText('Antonyms:')).toBeInTheDocument();
    expect(getByText('stillness')).toBeInTheDocument();
  });

  it('hides synonyms when disabled', () => {
    const { queryByText } = wrap(
      <AdditionalInfo showSynonyms={false} />, 
      info
    );
    expect(queryByText('Synonyms:')).toBeNull();
  });

  it('hides antonyms when disabled', () => {
    const { queryByText } = wrap(
      <AdditionalInfo showAntonyms={false} />, 
      info
    );
    expect(queryByText('Antonyms:')).toBeNull();
  });

  it('renders nothing when both sections hidden', () => {
    const { container } = wrap(
      <AdditionalInfo showSynonyms={false} showAntonyms={false} />, 
      info
    );
    expect(container.textContent).toBe('');
  });
});


