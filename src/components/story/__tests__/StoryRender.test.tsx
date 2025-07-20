import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import StoryRender from '../StoryRender';
import { TranslationResponse } from '../../../lib/translationService';

// Mock child components to isolate StoryRender testing
vi.mock('../StoryHeader', () => ({
  default: ({ showOriginal, onToggleView }: { showOriginal: boolean; onToggleView: () => void }) => (
    <div data-testid="story-header">
      <span>Header - showOriginal: {showOriginal.toString()}</span>
      <button onClick={onToggleView}>Toggle View</button>
    </div>
  )
}));

vi.mock('../StoryContent', () => ({
  default: ({ translationData, showOriginal }: { translationData: TranslationResponse; showOriginal: boolean }) => (
    <div data-testid="story-content">
      <span>Content - showOriginal: {showOriginal.toString()}</span>
      <span>{showOriginal ? translationData.originalText : translationData.translatedText}</span>
    </div>
  )
}));

describe('StoryRender Component', () => {
  const mockTranslationData: TranslationResponse = {
    originalText: 'Esta es una historia de prueba.',
    translatedText: 'This is a test story.',
    fromLanguage: 'Spanish',
    toLanguage: 'English',
    difficulty: 'A1',
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with translation data', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyHeader = within(container).getByTestId('story-header');
    const storyContent = within(container).getByTestId('story-content');

    expect(storyHeader).toBeInTheDocument();
    expect(storyContent).toBeInTheDocument();
  });

  it('returns null when translationData is not provided', () => {
    const { container } = render(
      <StoryRender translationData={null as unknown as TranslationResponse} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when translationData is undefined', () => {
    const { container } = render(
      <StoryRender translationData={undefined as unknown as TranslationResponse} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('initializes with showOriginal as false', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const header = within(container).getByTestId('story-header');
    const content = within(container).getByTestId('story-content');

    expect(within(header).getByText('Header - showOriginal: false')).toBeInTheDocument();
    expect(within(content).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(within(content).getByText('This is a test story.')).toBeInTheDocument();
  });

  it('has correct styling when showing translated story (showOriginal=false)', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyContainer = container.querySelector('.bg-green-50');
    expect(storyContainer).toBeInTheDocument();
    expect(storyContainer).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('toggles to original story when toggle button is clicked', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    // Initially showing translated
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(within(container).getByText('This is a test story.')).toBeInTheDocument();

    // Click toggle button
    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });
    fireEvent.click(toggleButton);

    // Now showing original
    expect(within(container).getByText('Header - showOriginal: true')).toBeInTheDocument();
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();
    expect(within(container).getByText('Esta es una historia de prueba.')).toBeInTheDocument();
  });

  it('has correct styling when showing original story (showOriginal=true)', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    // Click toggle to show original
    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });
    fireEvent.click(toggleButton);

    const storyContainer = container.querySelector('.bg-yellow-50');
    expect(storyContainer).toBeInTheDocument();
    expect(storyContainer).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('can toggle back and forth between views', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });

    // Start with translated (false)
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();

    // Toggle to original (true)
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();

    // Toggle back to translated (false)
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
  });

  it('passes correct props to StoryHeader', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyHeader = within(container).getByTestId('story-header');
    
    // Should pass translationData, showOriginal, and onToggleView
    expect(storyHeader).toBeInTheDocument();
    expect(within(storyHeader).getByText('Header - showOriginal: false')).toBeInTheDocument();
    expect(within(storyHeader).getByRole('button', { name: 'Toggle View' })).toBeInTheDocument();
  });

  it('passes correct props to StoryContent', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyContent = within(container).getByTestId('story-content');
    
    // Should pass translationData and showOriginal
    expect(storyContent).toBeInTheDocument();
    expect(within(storyContent).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(within(storyContent).getByText('This is a test story.')).toBeInTheDocument();
  });

  it('has proper container structure and classes', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const outerContainer = container.firstChild as HTMLElement;
    const storyContainer = container.querySelector('.p-4.border.rounded-md');

    expect(outerContainer).toHaveClass('mt-4', 'space-y-4');
    expect(storyContainer).toBeInTheDocument();
    expect(storyContainer).toHaveClass(
      'p-4',
      'border',
      'rounded-md',
      'transition-all',
      'duration-300',
      'relative'
    );
  });

  it('handles different translation data correctly', () => {
    const germanTranslationData: TranslationResponse = {
      originalText: 'Das ist eine deutsche Geschichte.',
      translatedText: 'This is a German story.',
      fromLanguage: 'German',
      toLanguage: 'English',
      difficulty: 'B1',
    };

    const { container } = render(
      <StoryRender translationData={germanTranslationData} />
    );

    // Check translated content is displayed initially
    expect(within(container).getByText('This is a German story.')).toBeInTheDocument();

    // Toggle to original
    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });
    fireEvent.click(toggleButton);

    // Check original content is displayed
    expect(within(container).getByText('Das ist eine deutsche Geschichte.')).toBeInTheDocument();
  });

  it('maintains state across multiple interactions', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });

    // Perform multiple toggles
    for (let i = 0; i < 5; i++) {
      fireEvent.click(toggleButton);
    }

    // Should end up in original view (odd number of clicks)
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();
    expect(within(container).getByText('Esta es una historia de prueba.')).toBeInTheDocument();
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
  });

  it('has transition classes for smooth animations', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyContainer = container.querySelector('.transition-all');
    expect(storyContainer).toHaveClass('transition-all', 'duration-300');
  });
}); 