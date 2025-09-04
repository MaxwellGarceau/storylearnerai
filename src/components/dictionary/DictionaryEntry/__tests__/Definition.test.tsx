import React from 'react';
import { render } from '@testing-library/react';
import Definition from '../Definition';
import Root from '../Root';
import type { DictionaryWord } from '../../../../types/dictionary';

const wrap = (
  ui: React.ReactNode,
  wordInfo: DictionaryWord | null
) => {
  return render(
    <Root word='echo' wordInfo={wordInfo} isLoading={false} error={null}>
      {ui}
    </Root>
  );
};

describe('DictionaryEntry.Definition', () => {
  const info: DictionaryWord = {
    word: 'echo',
    definitions: [
      {
        definition: 'a sound caused by reflection of sound waves',
        partOfSpeech: 'noun',
        examples: ['The canyon produced a clear echo.'],
      },
      {
        definition: 'repeat another’s words',
        partOfSpeech: 'verb',
      },
    ],
  };

  it('renders nothing when no wordInfo', () => {
    const { container } = wrap(<Definition />, null);
    expect(container.textContent).toBe('');
  });

  it('renders up to maxDefinitions', () => {
    const { getByText, queryByText } = wrap(
      <Definition maxDefinitions={1} />, 
      info
    );
    expect(getByText('1.')).toBeInTheDocument();
    expect(queryByText('2.')).toBeNull();
  });

  it('shows example when enabled', () => {
    const { getByText } = wrap(<Definition showExamples />, info);
    expect(getByText('"The canyon produced a clear echo."')).toBeInTheDocument();
  });

  it('hides example when disabled', () => {
    const { queryByText } = wrap(<Definition showExamples={false} />, info);
    expect(queryByText('"The canyon produced a clear echo."')).toBeNull();
  });
});


