import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import VocabularySection from '../VocabularySection';
import { setupSidebarMocks, resetSidebarMocks } from './sidebarMocks';

type VocabularySidebarProps = {
  currentLanguageId?: number;
  currentFromLanguageId?: number;
};

// Mock without referencing outer variables to avoid hoisting/TDZ issues
vi.mock('../../vocabulary/sidebar/VocabularySidebar', () => ({
  VocabularySidebar: (props: unknown) => (
    <div data-testid='vocabulary-sidebar' data-props={JSON.stringify(props)}>
      Vocabulary Sidebar Content
    </div>
  ),
}));

// Setup mocks before tests
setupSidebarMocks();

describe('VocabularySection Component', () => {
  beforeEach(() => {
    resetSidebarMocks();
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

    const el = screen.getByTestId('vocabulary-sidebar');
    const props = JSON.parse(
      el.getAttribute('data-props') ?? '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(currentLanguageId);
    expect(props.currentFromLanguageId).toBe(currentFromLanguageId);
  });

  it('handles undefined currentLanguageId', () => {
    render(
      <VocabularySection
        currentLanguageId={undefined}
        currentFromLanguageId={2}
      />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBeUndefined();
    expect(props.currentFromLanguageId).toBe(2);
  });

  it('handles undefined currentFromLanguageId', () => {
    render(
      <VocabularySection
        currentLanguageId={1}
        currentFromLanguageId={undefined}
      />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(1);
    expect(props.currentFromLanguageId).toBeUndefined();
  });

  it('handles both props undefined', () => {
    render(
      <VocabularySection
        currentLanguageId={undefined}
        currentFromLanguageId={undefined}
      />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBeUndefined();
    expect(props.currentFromLanguageId).toBeUndefined();
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
      const { unmount } = render(
        <VocabularySection
          currentLanguageId={currentLanguageId}
          currentFromLanguageId={currentFromLanguageId}
        />
      );
      const props = JSON.parse(
        screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
          '{}'
      ) as VocabularySidebarProps;
      expect(props.currentLanguageId).toBe(currentLanguageId);
      expect(props.currentFromLanguageId).toBe(currentFromLanguageId);
      unmount();
    });
  });

  it('maintains component stability across renders', () => {
    const { rerender } = render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    // Re-render with same props
    rerender(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(1);
    expect(props.currentFromLanguageId).toBe(2);
  });

  it('handles prop changes correctly', () => {
    const { rerender } = render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    let props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(1);
    expect(props.currentFromLanguageId).toBe(2);

    // Change props
    rerender(
      <VocabularySection currentLanguageId={3} currentFromLanguageId={4} />
    );

    props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(3);
    expect(props.currentFromLanguageId).toBe(4);
  });

  it('does not pass extra props to VocabularySidebar', () => {
    render(
      <VocabularySection currentLanguageId={1} currentFromLanguageId={2} />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(Object.keys(props)).toHaveLength(2);
    expect(props).toHaveProperty('currentLanguageId');
    expect(props).toHaveProperty('currentFromLanguageId');
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

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(largeId);
    expect(props.currentFromLanguageId).toBe(largeId);
  });

  it('handles zero as valid language ID', () => {
    render(
      <VocabularySection currentLanguageId={0} currentFromLanguageId={0} />
    );

    const props = JSON.parse(
      screen.getByTestId('vocabulary-sidebar').getAttribute('data-props') ??
        '{}'
    ) as VocabularySidebarProps;
    expect(props.currentLanguageId).toBe(0);
    expect(props.currentFromLanguageId).toBe(0);
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
