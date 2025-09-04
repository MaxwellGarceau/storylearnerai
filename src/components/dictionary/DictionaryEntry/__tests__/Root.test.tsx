import React from 'react';
import { render } from '@testing-library/react';
import Root from '../Root';
import { useDictionaryEntryContext } from '../Context';
import type { DictionaryWord } from '../../../../types/dictionary';

// Helper child component to read context values
const Probe: React.FC = () => {
  const { word, wordInfo, isLoading, error } = useDictionaryEntryContext();
  return (
    <>
      <span data-testid='word'>{word}</span>
      <span data-testid='isLoading'>{String(isLoading)}</span>
      <span data-testid='hasError'>{String(Boolean(error))}</span>
      <span data-testid='hasWordInfo'>{String(Boolean(wordInfo))}</span>
    </>
  );
};

describe('DictionaryEntry.Root', () => {
  const sampleWordInfo: DictionaryWord = {
    word: 'test',
    definitions: [
      {
        definition: 'a procedure intended to establish quality or performance',
        partOfSpeech: 'noun',
        examples: ['This is a test example.'],
      },
    ],
    phonetic: 'tɛst',
    synonyms: ['trial', 'exam'],
    antonyms: ['certainty'],
    frequency: { level: 'common' },
    source: 'unit-test',
  };

  it('provides context values to children', () => {
    const { getByTestId } = render(
      <Root word='check' wordInfo={sampleWordInfo} isLoading={false} error={null}>
        <Probe />
      </Root>
    );

    expect(getByTestId('word').textContent).toBe('check');
    expect(getByTestId('isLoading').textContent).toBe('false');
    expect(getByTestId('hasError').textContent).toBe('false');
    expect(getByTestId('hasWordInfo').textContent).toBe('true');
  });

  it('renders wrapping element with base classes', () => {
    const { container } = render(
      <Root word='word' wordInfo={null} isLoading={true} error={null}>
        <div>child</div>
      </Root>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('p-2', 'min-w-[200px]');
  });

  it('merges custom className', () => {
    const { container } = render(
      <Root
        word='word'
        wordInfo={null}
        isLoading={false}
        error={null}
        className='custom-class'
      >
        <div>child</div>
      </Root>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});


