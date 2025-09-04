import React from 'react';
import { render } from '@testing-library/react';
import DictionaryEntry from '../DictionaryEntry';
import type { DictionaryWord } from '../../../../types/dictionary';

describe('DictionaryEntry compound components (integration)', () => {
  const info: DictionaryWord = {
    word: 'hotel',
    phonetic: 'hoʊˈtɛl',
    definitions: [
      {
        definition: 'an establishment providing lodging',
        partOfSpeech: 'noun',
        examples: ['We stayed at a hotel.'],
      },
    ],
    frequency: { level: 'common' },
    source: 'integration-test',
  };

  it('renders header, definition, additional info and source by default', () => {
    const { getByText } = render(
      <DictionaryEntry.Root
        word='hotel'
        wordInfo={info}
        isLoading={false}
        error={null}
      >
        <DictionaryEntry.Content />
      </DictionaryEntry.Root>
    );

    expect(getByText('hotel')).toBeInTheDocument();
    expect(getByText('1.')).toBeInTheDocument();
    expect(getByText('Source: integration-test')).toBeInTheDocument();
  });

  it('respects custom Content children', () => {
    const { getByText, queryByText } = render(
      <DictionaryEntry.Root
        word='hotel'
        wordInfo={info}
        isLoading={false}
        error={null}
      >
        <DictionaryEntry.Content>
          <div>Custom layout</div>
        </DictionaryEntry.Content>
      </DictionaryEntry.Root>
    );

    expect(getByText('Custom layout')).toBeInTheDocument();
    expect(queryByText('1.')).toBeNull();
  });
});


