import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import VocabularySection from '../VocabularySection';
import { setupSidebarMocks, resetSidebarMocks } from './sidebarMocks';

// Mock the VocabularySidebar component
vi.mock('../../vocabulary/sidebar/VocabularySidebar', () => ({
  VocabularySidebar: vi.fn(() => (
    <div data-testid='vocabulary-sidebar'>Vocabulary Sidebar Content</div>
  )),
}));

// Import the mocked component
import { VocabularySidebar } from '../../vocabulary/sidebar/VocabularySidebar';

// Setup mocks before tests
setupSidebarMocks();

describe('VocabularySection Component', () => {
  const mockVocabularySidebar = VocabularySidebar as jest.MockedFunction<
    typeof VocabularySidebar
  >;

  beforeEach(() => {
    resetSidebarMocks();
    mockVocabularySidebar.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders VocabularySidebar component', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    expect(screen.getByTestId('vocabulary-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary Sidebar Content')).toBeInTheDocument();
  });

  it('passes currentLanguageId and currentFromLanguageId to VocabularySidebar', () => {
    const currentLanguageId = 1;
    const currentFromLanguageId = 2;

    render(
      <VocabularySection
        currentLanguageId={currentLanguageId}
        currentFromLanguageId={currentFromLanguageId}
      />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId,
        currentFromLanguageId,
      },
      {}
    );
  });

  it('handles undefined currentLanguageId', () => {
    render(
      <VocabularySection
        currentLanguageId={undefined}
        currentFromLanguageId={2}
      />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId: undefined,
        currentFromLanguageId: 2,
      },
      {}
    );
  });

  it('handles undefined currentFromLanguageId', () => {
    render(
      <VocabularySection
        currentLanguageId={1}
        currentFromLanguageId={undefined}
      />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId: 1,
        currentFromLanguageId: undefined,
      },
      {}
    );
  });

  it('handles both props undefined', () => {
    render(
      <VocabularySection
        currentLanguageId={undefined}
        currentFromLanguageId={undefined}
      />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId: undefined,
        currentFromLanguageId: undefined,
      },
      {}
    );
  });

  it('applies correct container styling', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const container = screen.getByTestId('vocabulary-sidebar').parentElement;
    expect(container).toHaveClass('p-4');
  });

  it('renders with correct structure', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const container = screen.getByTestId('vocabulary-sidebar').parentElement;
    expect(container).toBeInTheDocument();
    expect(container?.tagName).toBe('DIV');
  });

  it('passes numeric language IDs correctly', () => {
    const testCases = [
      { currentLanguageId: 1, currentFromLanguageId: 2 },
      { currentLanguageId: 5, currentFromLanguageId: 10 },
      { currentLanguageId: 100, currentFromLanguageId: 200 },
    ];

    testCases.forEach(({ currentLanguageId, currentFromLanguageId }) => {
      mockVocabularySidebar.mockClear();

      render(
        <VocabularySection
          currentLanguageId={currentLanguageId}
          currentFromLanguageId={currentFromLanguageId}
        />
      );

      expect(mockVocabularySidebar).toHaveBeenCalledWith(
        {
          currentLanguageId,
          currentFromLanguageId,
        },
        {}
      );
    });
  });

  it('maintains component stability across renders', () => {
    const { rerender } = render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledTimes(1);

    // Re-render with same props
    rerender(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledTimes(2);
    expect(mockVocabularySidebar).toHaveBeenNthCalledWith(
      2,
      {
        currentLanguageId: 1,
        currentFromLanguageId: 2,
      },
      {}
    );
  });

  it('handles prop changes correctly', () => {
    const { rerender } = render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    expect(mockVocabularySidebar).toHaveBeenNthCalledWith(
      1,
      {
        currentLanguageId: 1,
        currentFromLanguageId: 2,
      },
      {}
    );

    // Change props
    rerender(
      <VocabularySection currentLanguageId={3} currentFromLanguageId={4} />
    );

    expect(mockVocabularySidebar).toHaveBeenNthCalledWith(
      2,
      {
        currentLanguageId: 3,
        currentFromLanguageId: 4,
      },
      {}
    );
  });

  it('does not pass extra props to VocabularySidebar', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const callArgs = mockVocabularySidebar.mock.calls[0][0];
    expect(Object.keys(callArgs)).toHaveLength(2);
    expect(callArgs).toHaveProperty('currentLanguageId');
    expect(callArgs).toHaveProperty('currentFromLanguageId');
  });

  it('renders consistently with same props', () => {
    const props = { currentLanguageId: 1, currentFromLanguageId: 2 };

    const { rerender } = render(<VocabularySection {...props} />);

    const firstRender = screen.getByTestId('vocabulary-sidebar');

    rerender(<VocabularySection {...props} />);

    const secondRender = screen.getByTestId('vocabulary-sidebar');

    // Both renders should produce the same structure
    expect(firstRender).toBeInTheDocument();
    expect(secondRender).toBeInTheDocument();
  });

  it('handles large numeric IDs', () => {
    const largeId = 999999;

    render(
      <VocabularySection
        currentLanguageId={largeId}
        currentFromLanguageId={largeId}
      />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId: largeId,
        currentFromLanguageId: largeId,
      },
      {}
    );
  });

  it('handles zero as valid language ID', () => {
    render(
      <VocabularySection currentLanguageId={0} currentFromLanguageId={0} />
    );

    expect(mockVocabularySidebar).toHaveBeenCalledWith(
      {
        currentLanguageId: 0,
        currentFromLanguageId: 0,
      },
      {}
    );
  });

  it('maintains proper component hierarchy', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const container = screen.getByTestId('vocabulary-sidebar').parentElement;
    const root = container?.parentElement;

    // Should be properly nested
    expect(container?.parentElement).toBeInTheDocument();
    expect(root?.tagName).toBe('DIV');
  });
});
