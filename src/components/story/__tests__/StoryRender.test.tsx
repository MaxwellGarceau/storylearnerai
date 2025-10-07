import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import StoryRender from '../StoryRender';
import { TranslationResponse } from '../../../lib/translationService';

// Mock the child components
vi.mock('../StoryHeader', () => ({
  default: ({
    showFrom,
    onToggleView,
  }: {
    showFrom: boolean;
    onToggleView: () => void;
  }) => (
    <div data-testid='story-header'>
      <div>Header - showFrom: {showFrom.toString()}</div>
      <button onClick={onToggleView}>Toggle View</button>
    </div>
  ),
}));

vi.mock('../StoryContent', () => ({
  default: ({
    translationData,
    showFrom,
  }: {
    translationData: TranslationResponse;
    showFrom: boolean;
  }) => (
    <div data-testid='story-content'>
      <div>Content - showFrom: {showFrom.toString()}</div>
      <div>
        {showFrom ? translationData.fromText : translationData.toText}
      </div>
    </div>
  ),
}));

const mockTranslationData: TranslationResponse = {
  fromText: 'Esta es una historia de prueba.',
  toText: 'This is a test story.',
  fromLanguage: 'Spanish',
  toLanguage: 'en',
  difficulty: 'a1',
  provider: 'test',
  model: 'test-model',
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

    expect(
      within(container).getByText('This is a test story.')
    ).toBeInTheDocument();
    expect(
      within(container).queryByText('Esta es una historia de prueba.')
    ).not.toBeInTheDocument();
  });

  it('toggles to original story when toggle button is clicked', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    // Initially showing translated
    expect(
      within(container).getByText('Content - showFrom: false')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('This is a test story.')
    ).toBeInTheDocument();

    // Click toggle button
    const toggleButton = within(container).getByRole('button', {
      name: 'Toggle View',
    });
    fireEvent.click(toggleButton);

    // Now showing original
    expect(
      within(container).getByText('Header - showFrom: true')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('Content - showFrom: true')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('Esta es una historia de prueba.')
    ).toBeInTheDocument();
  });

  it('can toggle back and forth between views', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const toggleButton = within(container).getByRole('button', {
      name: 'Toggle View',
    });

    // Start with translated (false)
    expect(
      within(container).getByText('Content - showFrom: false')
    ).toBeInTheDocument();

    // Toggle to original (true)
    fireEvent.click(toggleButton);
    expect(
      within(container).getByText('Content - showFrom: true')
    ).toBeInTheDocument();

    // Toggle back to translated (false)
    fireEvent.click(toggleButton);
    expect(
      within(container).getByText('Content - showFrom: false')
    ).toBeInTheDocument();
  });

  it('passes correct props to StoryHeader', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyHeader = within(container).getByTestId('story-header');

    // Should pass translationData, showFrom, and onToggleView
    expect(storyHeader).toBeInTheDocument();
    expect(
      within(storyHeader).getByText('Header - showFrom: false')
    ).toBeInTheDocument();
    expect(
      within(storyHeader).getByRole('button', { name: 'Toggle View' })
    ).toBeInTheDocument();
  });

  it('passes correct props to StoryContent', () => {
    const { container } = render(
      <StoryRender translationData={mockTranslationData} />
    );

    const storyContent = within(container).getByTestId('story-content');

    // Should pass translationData and showFrom
    expect(storyContent).toBeInTheDocument();
    expect(
      within(storyContent).getByText('Content - showFrom: false')
    ).toBeInTheDocument();
    expect(
      within(storyContent).getByText('This is a test story.')
    ).toBeInTheDocument();
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

    const toggleButton = within(container).getByRole('button', {
      name: 'Toggle View',
    });

    // First toggle
    fireEvent.click(toggleButton);
    expect(
      within(container).getByText('Content - showFrom: true')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('Esta es una historia de prueba.')
    ).toBeInTheDocument();

    // Second toggle
    fireEvent.click(toggleButton);
    expect(
      within(container).getByText('Content - showFrom: false')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('This is a test story.')
    ).toBeInTheDocument();

    // Third toggle
    fireEvent.click(toggleButton);
    expect(
      within(container).getByText('Content - showFrom: true')
    ).toBeInTheDocument();
    expect(
      within(container).getByText('Esta es una historia de prueba.')
    ).toBeInTheDocument();
  });

  it('returns null when translationData is not provided', () => {
    const { container } = render(
      <StoryRender translationData={null as unknown as TranslationResponse} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles empty translation data gracefully', () => {
    const emptyTranslationData: TranslationResponse = {
      fromText: '',
      toText: '',
      fromLanguage: 'Spanish',
      toLanguage: 'en',
      difficulty: 'a1',
      provider: 'test',
      model: 'test-model',
    };

    const { container } = render(
      <StoryRender translationData={emptyTranslationData} />
    );

    expect(container).toBeInTheDocument();
    expect(within(container).getByTestId('story-header')).toBeInTheDocument();
    expect(within(container).getByTestId('story-content')).toBeInTheDocument();
  });
});
