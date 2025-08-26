import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import DictionaryEntry from '../DictionaryEntry';
import { DictionaryWord, DictionaryError } from '../../../../types/dictionary';

const mockWordInfo: DictionaryWord = {
  word: 'hello',
  phonetic: 'həˈloʊ',
  definitions: [
    {
      definition: 'A greeting or an expression of goodwill.',
      partOfSpeech: 'noun',
      examples: ['She gave me a warm hello.'],
      synonyms: ['greeting', 'salutation'],
      antonyms: ['goodbye', 'farewell'],
    },
    {
      definition: 'To greet with "hello".',
      partOfSpeech: 'verb',
      examples: ['He helloed me from across the street.'],
    },
  ],
  synonyms: ['greeting', 'salutation', 'hi', 'hey'],
  antonyms: ['goodbye', 'farewell', 'bye'],
  etymology: 'From Old English hēlā',
  audioUrl: 'https://example.com/hello.mp3',
  source: 'Test Dictionary',
  lastUpdated: '2024-01-01T00:00:00Z',
  frequency: {
    level: 'common',
  },
};

describe('DictionaryEntry', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Root Component', () => {
    it('should provide context to child components', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('[həˈloʊ]')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
          className='custom-class'
        >
          <DictionaryEntry.Header />
        </DictionaryEntry.Root>
      );

      const container = screen.getByText('hello').parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Header Component', () => {
    it('should display word header with all information', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('[həˈloʊ]')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
    });

    it('should hide phonetic when showPhonetic is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header showPhonetic={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.queryByText('[həˈloʊ]')).not.toBeInTheDocument();
    });

    it('should hide frequency when showFrequency is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header showFrequency={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.queryByText('common')).not.toBeInTheDocument();
    });

    it('should display just the word when no wordInfo', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.queryByText('[həˈloʊ]')).not.toBeInTheDocument();
    });
  });

  describe('Definition Component', () => {
    it('should display definitions with examples', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Definition />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('A greeting or an expression of goodwill.')
      ).toBeInTheDocument();
      expect(screen.getByText('To greet with "hello".')).toBeInTheDocument();
      expect(screen.getByText('noun')).toBeInTheDocument();
      expect(screen.getByText('verb')).toBeInTheDocument();
      expect(
        screen.getByText('"She gave me a warm hello."')
      ).toBeInTheDocument();
    });

    it('should limit definitions based on maxDefinitions', () => {
      const wordInfoWithManyDefinitions = {
        ...mockWordInfo,
        definitions: [
          ...mockWordInfo.definitions,
          { definition: 'Third definition', partOfSpeech: 'adjective' },
          { definition: 'Fourth definition', partOfSpeech: 'adverb' },
        ],
      };

      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={wordInfoWithManyDefinitions}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Definition maxDefinitions={2} />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('A greeting or an expression of goodwill.')
      ).toBeInTheDocument();
      expect(screen.getByText('To greet with "hello".')).toBeInTheDocument();
      expect(screen.queryByText('Third definition')).not.toBeInTheDocument();
    });

    it('should hide examples when showExamples is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Definition showExamples={false} />
        </DictionaryEntry.Root>
      );

      expect(
        screen.queryByText('"She gave me a warm hello."')
      ).not.toBeInTheDocument();
    });

    it('should return null when no wordInfo', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Definition />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });
  });

  describe('AdditionalInfo Component', () => {
    it('should display synonyms and antonyms', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.AdditionalInfo />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Synonyms: greeting, salutation, hi';
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Antonyms: goodbye, farewell';
        })
      ).toBeInTheDocument();
    });

    it('should limit synonyms and antonyms', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.AdditionalInfo maxSynonyms={2} maxAntonyms={1} />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Synonyms: greeting, salutation';
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Antonyms: goodbye';
        })
      ).toBeInTheDocument();
    });

    it('should hide synonyms when showSynonyms is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.AdditionalInfo showSynonyms={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.queryByText('Synonyms:')).not.toBeInTheDocument();
    });

    it('should hide antonyms when showAntonyms is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.AdditionalInfo showAntonyms={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.queryByText('Antonyms:')).not.toBeInTheDocument();
    });
  });

  describe('Source Component', () => {
    it('should display source information', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Source />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('Source: Test Dictionary')).toBeInTheDocument();
    });

    it('should hide source when showSource is false', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Source showSource={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.queryByText('Source:')).not.toBeInTheDocument();
    });
  });

  describe('LoadingMessage Component', () => {
    it('should display loading message when isLoading is true', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={true}
          error={null}
        >
          <DictionaryEntry.LoadingMessage />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(
        screen.getByText('Loading dictionary info...')
      ).toBeInTheDocument();
    });

    it('should display custom loading message', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={true}
          error={null}
        >
          <DictionaryEntry.LoadingMessage message='Custom loading...' />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('Custom loading...')).toBeInTheDocument();
    });

    it('should return null when not loading', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.LoadingMessage />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });
  });

  describe('ErrorMessage Component', () => {
    it('should display word not found error', () => {
      const error = new DictionaryError('WORD_NOT_FOUND', 'Word not found');
      render(
        <DictionaryEntry.Root
          word='nonexistent'
          wordInfo={null}
          isLoading={false}
          error={error}
        >
          <DictionaryEntry.ErrorMessage />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('nonexistent')).toBeInTheDocument();
      expect(
        screen.getByText('Word not found in dictionary')
      ).toBeInTheDocument();
    });

    it('should display generic error message', () => {
      const error = new DictionaryError('API_ERROR', 'API failed');
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={error}
        >
          <DictionaryEntry.ErrorMessage />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('Failed to load dictionary info')
      ).toBeInTheDocument();
    });

    it('should display custom error messages', () => {
      const error = new DictionaryError('API_ERROR', 'API failed');
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={error}
        >
          <DictionaryEntry.ErrorMessage
            errorMessage='Custom error'
            wordNotFoundMessage='Custom not found'
          />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('Custom error')).toBeInTheDocument();
    });

    it('should return null when no error', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.ErrorMessage />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });

    it('should display disabled dictionary message', () => {
      const error = new DictionaryError(
        'API_ERROR',
        'Dictionary service is disabled'
      );
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={error}
        >
          <DictionaryEntry.ErrorMessage />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(
        screen.getByText('Dictionary has been disabled')
      ).toBeInTheDocument();
    });
  });

  describe('DefaultMessage Component', () => {
    it('should display default message when no data', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.DefaultMessage />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(
        screen.getByText('Hover to see dictionary info')
      ).toBeInTheDocument();
    });

    it('should display custom default message', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.DefaultMessage message='Custom default' />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('Custom default')).toBeInTheDocument();
    });

    it('should return null when loading', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={true}
          error={null}
        >
          <DictionaryEntry.DefaultMessage />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });

    it('should return null when there is an error', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={new DictionaryError('API_ERROR', 'Test error')}
        >
          <DictionaryEntry.DefaultMessage />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });

    it('should return null when there is wordInfo', () => {
      const { container } = render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.DefaultMessage />
        </DictionaryEntry.Root>
      );

      expect(container.firstChild?.firstChild).toBeNull();
    });
  });

  describe('Content Component', () => {
    it('should render loading message when loading', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={true}
          error={null}
        >
          <DictionaryEntry.Content />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('Loading dictionary info...')
      ).toBeInTheDocument();
    });

    it('should render error message when there is an error', () => {
      const error = new DictionaryError('API_ERROR', 'API failed');
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={error}
        >
          <DictionaryEntry.Content />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('Failed to load dictionary info')
      ).toBeInTheDocument();
    });

    it('should render default content when there is wordInfo', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Content />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(
        screen.getByText('A greeting or an expression of goodwill.')
      ).toBeInTheDocument();
      expect(screen.getByText('Synonyms:')).toBeInTheDocument();
      expect(screen.getByText(/Test Dictionary/)).toBeInTheDocument();
    });

    it('should render custom children when provided', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Content>
            <div data-testid='custom-content'>Custom content</div>
          </DictionaryEntry.Content>
        </DictionaryEntry.Root>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    it('should render default message when no data', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={null}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Content />
        </DictionaryEntry.Root>
      );

      expect(
        screen.getByText('Hover to see dictionary info')
      ).toBeInTheDocument();
    });
  });

  describe('Custom Layout Example', () => {
    it('should allow custom layout with individual components', () => {
      render(
        <DictionaryEntry.Root
          word='hello'
          wordInfo={mockWordInfo}
          isLoading={false}
          error={null}
        >
          <DictionaryEntry.Header showFrequency={false} />
          <DictionaryEntry.Definition maxDefinitions={1} showExamples={false} />
          <DictionaryEntry.AdditionalInfo showAntonyms={false} />
          <DictionaryEntry.Source showSource={false} />
        </DictionaryEntry.Root>
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('[həˈloʊ]')).toBeInTheDocument();
      expect(screen.queryByText('common')).not.toBeInTheDocument();
      expect(
        screen.getByText('A greeting or an expression of goodwill.')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('"She gave me a warm hello."')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Synonyms:')).toBeInTheDocument();
      expect(screen.queryByText('Antonyms:')).not.toBeInTheDocument();
      expect(screen.queryByText('Source:')).not.toBeInTheDocument();
    });
  });
});
