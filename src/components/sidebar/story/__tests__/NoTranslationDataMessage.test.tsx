import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import NoTranslationDataMessage from '../NoTranslationDataMessage';
import {
  setupSidebarMocks,
  resetSidebarMocks,
} from '../../__tests__/sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

describe('NoTranslationDataMessage Component', () => {
  const messageMatcher = (content: string) =>
    content === 'storySidebar.noTranslationData' ||
    content === 'No translation data available to display.';

  beforeEach(() => {
    resetSidebarMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the no translation data message with correct styling', () => {
    render(<NoTranslationDataMessage />);

    const messageContainer = screen.getByText(messageMatcher);
    expect(messageContainer).toBeInTheDocument();
    expect(messageContainer).toHaveClass('text-muted-foreground');

    // Check parent container has correct classes
    const container = messageContainer.closest('div');
    expect(container).toHaveClass('p-4', 'text-center');
  });

  it('applies custom className when provided', () => {
    const customClassName = 'custom-class';
    render(<NoTranslationDataMessage className={customClassName} />);

    const container = screen.getByText(messageMatcher).closest('div');
    expect(container).toHaveClass('p-4', 'text-center', 'custom-class');
  });

  it('displays the translated message text', () => {
    render(<NoTranslationDataMessage />);

    // The component should display either the i18n key or translated text
    expect(screen.getByText(messageMatcher)).toBeInTheDocument();
  });

  it('renders without custom className when not provided', () => {
    render(<NoTranslationDataMessage />);

    const container = screen.getByText(messageMatcher).closest('div');
    expect(container).toHaveClass('p-4', 'text-center');
    expect(container).not.toHaveClass('custom-class');
  });

  it('handles empty className prop gracefully', () => {
    render(<NoTranslationDataMessage className='' />);

    const container = screen.getByText(messageMatcher).closest('div');
    expect(container).toHaveClass('p-4', 'text-center');
  });
});
