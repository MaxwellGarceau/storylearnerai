import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordMenu from '../WordMenu';
import type { VoidFunction } from '../../../types/common';
import * as useAuthModule from '../../../hooks/useAuth';
import type { LanguageCode } from '../../../types/llm/prompts';
import { MemoryRouter } from 'react-router-dom';

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
vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    getLanguageIdByCode: vi.fn((code: string) => {
      const languageMap: Record<string, number> = {
        en: 1,
        es: 2,
      };
      return languageMap[code] || null;
    }),
  }),
}));

// Mock the VocabularySaveButton component
vi.mock('../../vocabulary/VocabularySaveButton', () => ({
  VocabularySaveButton: ({
    originalWord,
    translatedWord,
    fromLanguageId,
    translatedLanguageId,
    onClick,
    children,
  }: {
    originalWord: string;
    translatedWord: string;
    fromLanguageId: number;
    translatedLanguageId: number;
    onClick?: () => void;
    children?: React.ReactNode;
  }) => (
    <button
      data-testid='vocabulary-save-button'
      data-original-word={originalWord}
      data-translated-word={translatedWord}
      data-from-language-id={fromLanguageId}
      data-translated-language-id={translatedLanguageId}
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

  it('hides menu actions when user is logged out', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuthModule.useAuth>);

    render(
      <MemoryRouter>
        <WordMenu
          word='hello'
          open={true}
          fromLanguage='en'
          targetLanguage='es'
        >
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
      <WordMenu word='hello' open={true} fromLanguage='en' targetLanguage='es'>
        <span>hello</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('displays the word in the menu header', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='world' open={true} fromLanguage='en' targetLanguage='es'>
        <span>world</span>
      </WordMenu>
    );

    // Check that the word appears in the menu header (the div with text-sm font-medium class)
    const menuHeader = screen.getByText('world', {
      selector: '.text-sm.font-medium',
    });
    expect(menuHeader).toBeInTheDocument();
  });

  it('renders translate, dictionary, and vocabulary save buttons', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');

    expect(buttons).toHaveLength(2); // Translate and Dictionary buttons
    expect(vocabularySaveButton).toBeInTheDocument(); // VocabularySaveButton
  });

  it('calls onTranslate when translate button is clicked and keeps menu open', () => {
    mockLoggedIn();
    const handleTranslate = vi.fn();
    const handleOpenChange = vi.fn();

    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        onTranslate={handleTranslate}
        onOpenChange={handleOpenChange}
        fromLanguage='en'
        targetLanguage='es'
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // First button should be translate

    expect(handleTranslate).toHaveBeenCalledWith('hello');
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('renders VocabularySaveButton with correct props', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='world'
        open={true}
        fromLanguage='en'
        targetLanguage='es'
        translatedWord='mundo'
      >
        <span>world</span>
      </WordMenu>
    );

    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');
    expect(vocabularySaveButton).toHaveAttribute('data-original-word', 'world');
    expect(vocabularySaveButton).toHaveAttribute(
      'data-translated-word',
      'mundo'
    );
    expect(vocabularySaveButton).toHaveAttribute('data-from-language-id', '1');
    expect(vocabularySaveButton).toHaveAttribute(
      'data-translated-language-id',
      '2'
    );
  });

  it('shows dictionary content when dictionary button is clicked', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
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
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
  });

  it('renders with closed state', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' open={false} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
  });

  it('renders trigger with asChild prop', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-trigger')).toHaveAttribute(
      'data-as-child',
      'true'
    );
  });

  it('does not render VocabularySaveButton when language IDs are not available', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='test'
        open={true}
        fromLanguage={'unsupported' as unknown as LanguageCode}
        targetLanguage={'unsupported' as unknown as LanguageCode}
      >
        <span>test</span>
      </WordMenu>
    );

    const vocabularySaveButton = screen.queryByTestId('vocabulary-save-button');
    expect(vocabularySaveButton).not.toBeInTheDocument();
  });

  it('shows translating spinner and text when isTranslating is true', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        isTranslating={true}
        fromLanguage='en'
        targetLanguage='es'
      >
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
      <WordMenu
        word='hello'
        open={true}
        isTranslating={false}
        fromLanguage='en'
        targetLanguage='es'
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Translate" text
    expect(translateButton).toHaveTextContent('Translate');

    // Should not be disabled
    expect(translateButton).not.toBeDisabled();

    // Should not have spinner
    const spinner = translateButton.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('does not call onTranslate when clicking translate button while translating', () => {
    mockLoggedIn();
    const handleTranslate = vi.fn();

    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        isTranslating={true}
        onTranslate={handleTranslate}
        fromLanguage='en'
        targetLanguage='es'
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // Translate button

    // Should not call onTranslate when translating
    expect(handleTranslate).not.toHaveBeenCalled();
  });

  it('shows "Translated" button when word has been translated but not saved', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        translatedWord='hola'
        fromLanguage='en'
        targetLanguage='es'
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Translated" text
    expect(translateButton).toHaveTextContent('Translated');

    // Should be disabled
    expect(translateButton).toBeDisabled();
  });

  it('shows "Already Saved" button when word has saved translation', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        isSaved={true}
        translatedWord='hola'
        fromLanguage='en'
        targetLanguage='es'
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const translateButton = buttons[0];

    // Should show "Already Saved" text
    expect(translateButton).toHaveTextContent('Already Saved');

    // Should be disabled
    expect(translateButton).toBeDisabled();
  });

  it('enables translate button for saved words without translation', () => {
    mockLoggedIn();
    renderWithRouter(
      <WordMenu
        word='hello'
        open={true}
        isSaved={true}
        fromLanguage='en'
        targetLanguage='es'
      >
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
