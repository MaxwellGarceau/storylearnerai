import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import SidebarContainer from '../SidebarContainer';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockTranslationData,
} from './sidebarMocks';

// Setup mocks before tests
setupSidebarMocks();

// Mock StorySidebar and GrammarSidebar to inspect props and simulate toggles
vi.mock('../story/StorySidebar', () => ({
  default: ({
    isOpen,
    onOpen,
    hideToggle,
  }: {
    isOpen: boolean;
    onOpen: () => void;
    hideToggle?: boolean;
  }) => (
    <div data-testid='story-sidebar' data-open={String(isOpen)}>
      Story Sidebar
      {!isOpen && !hideToggle && <button onClick={onOpen}>Open Story</button>}
    </div>
  ),
}));

vi.mock('../grammar/GrammarSidebar', () => ({
  default: ({
    isOpen,
    onOpen,
    hideToggle,
  }: {
    isOpen: boolean;
    onOpen: () => void;
    hideToggle?: boolean;
  }) => (
    <div data-testid='grammar-sidebar' data-open={String(isOpen)}>
      Grammar Sidebar
      {!isOpen && !hideToggle && <button onClick={onOpen}>Open Grammar</button>}
    </div>
  ),
}));

describe('SidebarContainer', () => {
  beforeEach(() => {
    resetSidebarMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders both sidebars in closed state initially', () => {
    render(<SidebarContainer translationData={mockTranslationData} />);

    const story = screen.getByTestId('story-sidebar');
    const grammar = screen.getByTestId('grammar-sidebar');

    expect(story).toBeInTheDocument();
    expect(grammar).toBeInTheDocument();
    expect(story.getAttribute('data-open')).toBe('false');
    expect(grammar.getAttribute('data-open')).toBe('false');
  });

  it('opens story sidebar and hides grammar toggle', () => {
    render(<SidebarContainer translationData={mockTranslationData} />);

    fireEvent.click(screen.getByText('Open Story'));

    const story = screen.getByTestId('story-sidebar');
    const grammar = screen.getByTestId('grammar-sidebar');

    expect(story.getAttribute('data-open')).toBe('true');

    // Grammar toggle should be hidden when story is open, so its button should not exist
    expect(screen.queryByText('Open Grammar')).toBeNull();

    // Story open implies grammar closed
    expect(grammar.getAttribute('data-open')).toBe('false');
  });

  it('opens grammar sidebar and hides story toggle', () => {
    render(<SidebarContainer translationData={mockTranslationData} />);

    fireEvent.click(screen.getByText('Open Grammar'));

    const grammar = screen.getByTestId('grammar-sidebar');
    const story = screen.getByTestId('story-sidebar');

    expect(grammar.getAttribute('data-open')).toBe('true');

    // Story toggle should be hidden when grammar is open
    expect(screen.queryByText('Open Story')).toBeNull();

    // Grammar open implies story closed
    expect(story.getAttribute('data-open')).toBe('false');
  });
});
