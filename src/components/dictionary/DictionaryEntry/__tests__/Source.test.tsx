import React from 'react';
import { render } from '@testing-library/react';
import Source from '../Source';
import Root from '../Root';
import type { DictionaryWord } from '../../../../types/dictionary';

const mount = (wordInfo: DictionaryWord | null, showSource?: boolean) => {
  return render(
    <Root word='golf' wordInfo={wordInfo} isLoading={false} error={null}>
      <Source showSource={showSource} />
    </Root>
  );
};

describe('DictionaryEntry.Source', () => {
  const infoWithSource: DictionaryWord = {
    word: 'golf',
    definitions: [{ definition: 'a club-and-ball sport' }],
    source: 'Lexicala',
  };

  const infoNoSource: DictionaryWord = {
    word: 'golf',
    definitions: [{ definition: 'a club-and-ball sport' }],
  };

  it('renders nothing when no wordInfo', () => {
    const { container } = mount(null);
    expect(container.textContent).toBe('');
  });

  it('renders provided source value', () => {
    const { getByText } = mount(infoWithSource);
    expect(getByText('Source: Lexicala')).toBeInTheDocument();
  });

  it('falls back to default label when no source in wordInfo', () => {
    const { getByText } = mount(infoNoSource);
    expect(getByText('Source: Dictionary API')).toBeInTheDocument();
  });

  it('hides when showSource=false', () => {
    const { container } = mount(infoWithSource, false);
    expect(container.textContent).toBe('');
  });
});
