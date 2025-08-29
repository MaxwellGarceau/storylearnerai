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
  Bookmark: () => <span data-testid='bookmark-icon'>Bookmark</span>,
  BookOpen: () => <span data-testid='dictionary-icon'>Dictionary</span>,
}));

describe('WordMenu Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with word text', () => {
    render(
      <WordMenu word='hello' open={true}>
        <span>hello</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('displays the word in the menu header', () => {
    render(
      <WordMenu word='world' open={true}>
        <span>world</span>
      </WordMenu>
    );

    // Check that the word appears in the menu header (the div with text-sm font-medium class)
    const menuHeader = screen.getByText('world', {
      selector: '.text-sm.font-medium',
    });
    expect(menuHeader).toBeInTheDocument();
  });

  it('renders translate, dictionary, and save buttons', () => {
    render(
      <WordMenu word='test' open={true}>
        <span>test</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(3);
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
      >
        <span>hello</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // First button should be translate

    expect(handleTranslate).toHaveBeenCalledWith('hello');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onSave when save button is clicked', () => {
    const handleSave = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <WordMenu
        word='world'
        open={true}
        onSave={handleSave}
        onOpenChange={handleOpenChange}
      >
        <span>world</span>
      </WordMenu>
    );

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[2]); // Third button should be save

    expect(handleSave).toHaveBeenCalledWith('world');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows dictionary content when dictionary button is clicked', () => {
    render(
      <WordMenu word='test' open={true}>
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
      <WordMenu word='test' open={true}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
  });

  it('renders with closed state', () => {
    render(
      <WordMenu word='test' open={false}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');
  });

  it('renders trigger with asChild prop', () => {
    render(
      <WordMenu word='test' open={true}>
        <span>test</span>
      </WordMenu>
    );

    expect(screen.getByTestId('popover-trigger')).toHaveAttribute(
      'data-as-child',
      'true'
    );
  });
});
