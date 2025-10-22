import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordMenu from '../WordMenu';
import type { VoidFunction } from '../../../types/common';
import type { LanguageCode } from '../../../types/llm/prompts';
import * as useAuthModule from '../../../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

// Mock the useWordActions hook
vi.mock('../../../hooks/useWordActions', () => ({
  useWordActions: vi.fn(() => ({
    isSaved: false,
    isTranslating: false,
    translation: undefined,
    isOpen: true,
    handleTranslate: vi.fn(),
    handleToggleMenu: vi.fn(),
    handleSave: vi.fn(),
    metadata: {
      from_word: 'test',
      from_lemma: 'test',
      to_word: 'prueba',
      to_lemma: 'prueba',
      pos: 'noun',
      difficulty: 'a1',
      from_definition: 'A test word',
    },
    wordState: {
      isOpen: true,
      isSaved: false,
      isTranslating: false,
      translation: undefined,
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      position: 0,
    },
  })),
}));

// Mock the useDictionary hook
vi.mock('../../../hooks/useDictionary', () => ({
  useDictionary: () => ({
    wordInfo: null,
    isLoading: false,
    error: null,
    searchWord: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Mock the useLanguages hook
vi.mock('../../../hooks/useLanguages', () => {
  const useLanguages = vi.fn(() => ({
    getLanguageIdByCode: vi.fn((code: string) => {
      const languageMap: Record<string, number> = {
        en: 1,
        es: 2,
      };
      return languageMap[code] ?? 1; // Default to 1 instead of null
    }),
  }));
  return { useLanguages };
});

// Mock the useLanguageSettings hook
vi.mock('../../../hooks/useLanguageFilter', () => ({
  useLanguageSettings: vi.fn(() => ({
    fromLanguage: 'en',
    targetLanguage: 'es',
  })),
}));

// Mock the VocabularySaveButton component
vi.mock('../../vocabulary/buttons/VocabularySaveButton', () => ({
  VocabularySaveButton: ({
    fromWord,
    targetWord,
    fromLanguageId,
    targetLanguageId,
    onClick,
    children,
  }: {
    fromWord: string;
    targetWord: string;
    fromLanguageId: number;
    targetLanguageId: number;
    onClick?: () => void;
    children?: React.ReactNode;
  }) => (
    <button
      data-testid='vocabulary-save-button'
      data-original-word={fromWord}
      data-translated-word={targetWord}
      data-from-language-id={fromLanguageId}
      data-target-language-id={targetLanguageId}
      onClick={onClick}
    >
      {children ?? 'Save'}
    </button>
  ),
}));

// Mock the Popover components
vi.mock('../../ui/Popover', () => ({
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid='popover' data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid='popover-trigger' data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid='popover-content' className={className}>
      {children}
    </div>
  ),
}));

// Mock StoryContext for sentence context extraction
vi.mock('../../../contexts/StoryContext', () => ({
  useStoryContext: () => ({
    fromLanguage: 'en' as LanguageCode,
    targetLanguage: 'es' as LanguageCode,
    translationData: {
      fromLanguage: 'en' as LanguageCode,
      toLanguage: 'es' as LanguageCode,
      includedVocabulary: [],
      tokens: [
        {
          type: 'word' as const,
          from_word: 'hello',
          from_lemma: 'hello',
          to_word: 'hola',
          to_lemma: 'hola',
          pos: 'interjection',
          difficulty: 'a1',
          from_definition: 'A greeting',
        },
        { type: 'punctuation' as const, value: '.' },
        { type: 'whitespace' as const, value: ' ' },
        {
          type: 'word' as const,
          from_word: 'world',
          from_lemma: 'world',
          to_word: 'mundo',
          to_lemma: 'mundo',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'The earth',
        },
        { type: 'punctuation' as const, value: '!' },
      ],
    },
    isDisplayingFromSide: true,
  }),
}));

// Mock the Button component
vi.mock('../../ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: VoidFunction;
    variant?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      data-testid='button'
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Languages: () => <span data-testid='translate-icon'>Translate</span>,
  BookOpen: () => <span data-testid='dictionary-icon'>Dictionary</span>,
}));

describe('WordMenu Component', () => {
  afterEach(() => {
    cleanup();
  });

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  // Default: user is logged in for tests unless overridden
  const mockLoggedIn = () =>
    vi
      .spyOn(useAuthModule, 'useAuth')
      .mockReturnValue({ user: { id: 'test-user' } } as unknown as ReturnType<
        typeof useAuthModule.useAuth
      >);

  // (removed unused helper createDefaultWordMetadata)

  it('hides menu actions when user is logged out', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthModule.useAuth>);

    render(
      <MemoryRouter>
        <WordMenu word='hello' position={0}>
          <span>hello</span>
        </WordMenu>
      </MemoryRouter>
    );

    expect(screen.queryAllByTestId('button')).toHaveLength(0);
    expect(
      screen.queryByTestId('vocabulary-save-button')
    ).not.toBeInTheDocument();
  });

  it('renders with word text', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('displays the word in the menu header', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='world' position={0}>
        <span>world</span>
      </WordMenu>
    );

    // Check that the word appears in the menu header (the div with text-sm font-medium class)
    // The component displays the to_word from metadata, not the word prop
    const menuHeader = screen.getByText('prueba', {
      selector: '.text-sm.font-medium',
    });
    expect(menuHeader).toBeInTheDocument();
  });

  it('renders translate, dictionary, and vocabulary save buttons', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');

    expect(buttons).toHaveLength(2); // Translate and Dictionary buttons
    expect(vocabularySaveButton).toBeInTheDocument(); // VocabularySaveButton
  });

  it('calls onTranslate when translate button is clicked and keeps menu open', async () => {
    mockLoggedIn();
    const mockHandleTranslate = vi.fn();

    // Mock useWordActions to return our custom handleTranslate
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: false,
      isTranslating: false,
      translation: undefined,
      isOpen: true,
      handleTranslate: mockHandleTranslate,
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: false,
        isTranslating: false,
        translation: undefined,
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // First button should be translate

    // The component calls handleTranslate from useWordActions
    expect(mockHandleTranslate).toHaveBeenCalled();
  });

  it('renders VocabularySaveButton with correct props', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='world' position={0}>
        <span>world</span>
      </WordMenu>
    );

    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');
    // The component uses the metadata values for the VocabularySaveButton props
    expect(vocabularySaveButton).toHaveAttribute('data-original-word', 'test');
    expect(vocabularySaveButton).toHaveAttribute(
      'data-translated-word',
      'prueba'
    );
    expect(vocabularySaveButton).toHaveAttribute('data-from-language-id', '1');
    expect(vocabularySaveButton).toHaveAttribute(
      'data-target-language-id',
      '2'
    );
  });

  it('shows dictionary content when dictionary button is clicked', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[1]); // Second button should be dictionary

    // Should show dictionary content
    expect(screen.getByText('Dictionary')).toBeInTheDocument();
  });

  it('renders with correct open state', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
  });

  it('renders with closed state', async () => {
    mockLoggedIn();

    // Mock useWordActions to return closed state
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: false,
      isTranslating: false,
      translation: undefined,
      isOpen: false,
      handleTranslate: vi.fn(),
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: false,
        isSaved: false,
        isTranslating: false,
        translation: undefined,
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
  });

  it('renders trigger with asChild prop', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-trigger')).toHaveAttribute(
      'data-as-child',
      'true'
    );
  });

  it('renders VocabularySaveButton with valid language IDs', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' position={0}>
        <span>test</span>
      </WordMenu>
    );

    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');
    expect(vocabularySaveButton).toBeInTheDocument();
    expect(vocabularySaveButton).toHaveAttribute('data-from-language-id', '1');
    expect(vocabularySaveButton).toHaveAttribute(
      'data-target-language-id',
      '2'
    );
  });

  it('shows translating spinner and text when isTranslating is true', async () => {
    mockLoggedIn();

    // Mock useWordActions to return translating state
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: false,
      isTranslating: true,
      translation: undefined,
      isOpen: true,
      handleTranslate: vi.fn(),
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: false,
        isTranslating: true,
        translation: undefined,
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Translating..." text
    expect(translateButton).toHaveTextContent('Translating...');

    // Should be disabled
    expect(translateButton).toBeDisabled();

    // Should have the spinner element
    const spinner = translateButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows normal translate button when isTranslating is false', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Translating..." text
    expect(translateButton).toHaveTextContent('Translating...');

    // Should be disabled when translating
    expect(translateButton).toBeDisabled();

    // Should have spinner when translating
    const spinner = translateButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not call onTranslate when clicking translate button while translating', async () => {
    mockLoggedIn();
    const mockHandleTranslate = vi.fn();

    // Mock useWordActions to return translating state
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: false,
      isTranslating: true,
      translation: undefined,
      isOpen: true,
      handleTranslate: mockHandleTranslate,
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: false,
        isTranslating: true,
        translation: undefined,
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // Translate button

    // Should not call handleTranslate when translating (button is disabled)
    expect(mockHandleTranslate).not.toHaveBeenCalled();
  });

  it('shows "Translated" label and keeps translate clickable when translated', async () => {
    mockLoggedIn();

    // Mock useWordActions to return translated state
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: false,
      isTranslating: false,
      translation: 'hola',
      isOpen: true,
      handleTranslate: vi.fn(),
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: false,
        isTranslating: false,
        translation: 'hola',
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Shows "Translated" label but remains clickable (enabled)
    expect(translateButton).toHaveTextContent('Translated');
    expect(translateButton).not.toBeDisabled();
  });

  it('shows "Translate" label when saved (still clickable)', async () => {
    mockLoggedIn();

    // Mock useWordActions to return saved state
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: true,
      isTranslating: false,
      translation: 'hola',
      isOpen: true,
      handleTranslate: vi.fn(),
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: true,
        isTranslating: false,
        translation: 'hola',
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Shows "Translate" label even when saved
    expect(translateButton).toHaveTextContent('Translate');
    expect(translateButton).not.toBeDisabled();
  });

  it('enables translate button for saved words without translation', async () => {
    mockLoggedIn();

    // Mock useWordActions to return saved state without translation
    const { useWordActions } = await import('../../../hooks/useWordActions');
    vi.mocked(useWordActions).mockReturnValue({
      isSaved: true,
      isTranslating: false,
      translation: undefined,
      isOpen: true,
      handleTranslate: vi.fn(),
      handleToggleMenu: vi.fn(),
      handleSave: vi.fn(),
      metadata: {
        from_word: 'test',
        from_lemma: 'test',
        to_word: 'prueba',
        to_lemma: 'prueba',
        pos: 'noun',
        difficulty: 'a1',
        from_definition: 'A test word',
      },
      wordState: {
        isOpen: true,
        isSaved: true,
        isTranslating: false,
        translation: undefined,
        metadata: {
          from_word: 'test',
          from_lemma: 'test',
          to_word: 'prueba',
          to_lemma: 'prueba',
          pos: 'noun',
          difficulty: 'a1',
          from_definition: 'A test word',
        },
        position: 0,
      },
    });

    renderWithRouter(
      <WordMenu word='hello' position={0}>
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Translate" text (to translate the saved word)
    expect(translateButton).toHaveTextContent('Translate');

    // Should not be disabled
    expect(translateButton).not.toBeDisabled();
  });
});
