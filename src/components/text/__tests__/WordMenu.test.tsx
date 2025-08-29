import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordMenu from '../WordMenu';

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
      {children || 'Save'}
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
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      data-testid='button'
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
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

  it('renders with word text', () => {
    render(
      <WordMenu word='hello' open={true} fromLanguage='en' targetLanguage='es'>
        <span>hello</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('displays the word in the menu header', () => {
    render(
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
    render(
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    const vocabularySaveButton = screen.getByTestId('vocabulary-save-button');

    expect(buttons).toHaveLength(2); // Translate and Dictionary buttons
    expect(vocabularySaveButton).toBeInTheDocument(); // VocabularySaveButton
  });

  it('calls onTranslate when translate button is clicked', () => {
    const handleTranslate = vi.fn();
    const handleOpenChange = vi.fn();

    render(
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
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders VocabularySaveButton with correct props', () => {
    render(
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
    render(
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
    render(
      <WordMenu word='test' open={true} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
  });

  it('renders with closed state', () => {
    render(
      <WordMenu word='test' open={false} fromLanguage='en' targetLanguage='es'>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
  });

  it('renders trigger with asChild prop', () => {
    render(
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
    render(
      <WordMenu
        word='test'
        open={true}
        fromLanguage='unsupported'
        targetLanguage='unsupported'
      >
        <span>test</span>
      </WordMenu>
    );

    const vocabularySaveButton = screen.queryByTestId('vocabulary-save-button');
    expect(vocabularySaveButton).not.toBeInTheDocument();
  });
});
