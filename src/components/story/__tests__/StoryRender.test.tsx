import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import StoryRender from '../StoryRender';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the child components
vi.mock('../StoryHeader', () => ({
  default: ({ showOriginal, onToggleView }: { showOriginal: boolean; onToggleView: () => void }) => (
    <div data-testid="story-header">
      <div>Header - showOriginal: {showOriginal.toString()}</div>
      <button onClick={onToggleView}>Toggle View</button>
    </div>
  ),
}));

vi.mock('../StoryContent', () => ({
  default: ({ translationData, showOriginal }: { translationData: TranslationResponse; showOriginal: boolean }) => (
    <div data-testid="story-content">
      <div>Content - showOriginal: {showOriginal.toString()}</div>
      <div>{showOriginal ? translationData.originalText : translationData.translatedText}</div>
    </div>
  ),
}));

const mockTranslationData: TranslationResponse = {
  originalText: 'Esta es una historia de prueba.',
  translatedText: 'This is a test story.',
  fromLanguage: 'Spanish',
  toLanguage: 'en',
  difficulty: 'a1',
  provider: 'test',
  model: 'test-model'
};

describe('StoryRender Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders StoryHeader and StoryContent components', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    expect(within(container).getByTestId('story-header')).toBeInTheDocument();
    expect(within(container).getByTestId('story-content')).toBeInTheDocument();
  });

  it('displays translated text by default', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    expect(within(container).getByText('This is a test story.')).toBeInTheDocument();
    expect(within(container).queryByText('Esta es una historia de prueba.')).not.toBeInTheDocument();
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

  it('can toggle back and forth between views', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });

    // Start with translated (false)
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();

    // Toggle to original (true)
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();

    // Toggle back to translated (false)
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();
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

    expect(outerContainer).toHaveClass('space-y-4');
  });

  it('maintains state across multiple interactions', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const toggleButton = within(container).getByRole('button', { name: 'Toggle View' });

    // First toggle
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();
    expect(within(container).getByText('Esta es una historia de prueba.')).toBeInTheDocument();

    // Second toggle
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: false')).toBeInTheDocument();
    expect(within(container).getByText('This is a test story.')).toBeInTheDocument();

    // Third toggle
    fireEvent.click(toggleButton);
    expect(within(container).getByText('Content - showOriginal: true')).toBeInTheDocument();
    expect(within(container).getByText('Esta es una historia de prueba.')).toBeInTheDocument();
  });

  it('returns null when translationData is not provided', () => {
    const { container } = render(<StoryRender translationData={null as unknown as TranslationResponse} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles empty translation data gracefully', () => {
    const emptyTranslationData: TranslationResponse = {
      originalText: '',
      translatedText: '',
      fromLanguage: 'Spanish',
      toLanguage: 'en',
      difficulty: 'a1',
      provider: 'test',
      model: 'test-model'
    };

    const { container } = render(
      <StoryRender translationData={emptyTranslationData} />
    );

    expect(container).toBeInTheDocument();
    expect(within(container).getByTestId('story-header')).toBeInTheDocument();
    expect(within(container).getByTestId('story-content')).toBeInTheDocument();
  });
}); 