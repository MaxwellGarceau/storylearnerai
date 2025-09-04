import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InfoSection from '../InfoSection';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockTranslationData,
  mockT,
} from './sidebarMocks';
import type { DifficultyLevel, LanguageCode } from '../../../types/llm/prompts';

// Setup mocks before tests
setupSidebarMocks();

describe('InfoSection Component', () => {
  const mockGetLanguageName = vi.fn();
  const mockGetDifficultyColor = vi.fn();
  const mockGetDifficultyLabel = vi.fn();

  const defaultProps = {
    translationData: mockTranslationData,
    getLanguageName: mockGetLanguageName,
    getDifficultyColor: mockGetDifficultyColor,
    getDifficultyLabel: mockGetDifficultyLabel,
    t: mockT,
  };

  beforeEach(() => {
    resetSidebarMocks();
    mockGetLanguageName.mockImplementation((code: LanguageCode) => {
      const names: Record<LanguageCode, string> = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        ru: 'Russian',
        ja: 'Japanese',
        ko: 'Korean',
        zh: 'Chinese',
      };
      return names[code] || code;
    });

    mockGetDifficultyColor.mockImplementation((difficulty: DifficultyLevel) => {
      const colors: Record<DifficultyLevel, string> = {
        a1: 'bg-green-100 text-green-800',
        a2: 'bg-blue-100 text-blue-800',
        b1: 'bg-yellow-100 text-yellow-800',
        b2: 'bg-purple-100 text-purple-800',
      };
      return colors[difficulty] || 'bg-gray-100 text-gray-800';
    });

    mockGetDifficultyLabel.mockImplementation((difficulty: DifficultyLevel) => {
      return difficulty.toUpperCase();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders story options header and description', () => {
    render(<InfoSection {...defaultProps} />);

    expect(screen.getByText('storySidebar.storyOptions')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.currentSettings')).toBeInTheDocument();
  });

  it('displays translation information correctly', () => {
    render(<InfoSection {...defaultProps} />);

    expect(mockGetLanguageName).toHaveBeenCalledWith('en');
    expect(mockGetLanguageName).toHaveBeenCalledWith('es');

    // Check for the translation text within the strong element
    const translationText = screen.getByText((content) => content.includes('storySidebar.translation'));
    expect(translationText).toBeInTheDocument();
    expect(screen.getByText('English → Spanish')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.optionsEditing')).toBeInTheDocument();
  });

  it('renders translation card with correct styling', () => {
    render(<InfoSection {...defaultProps} />);

    const translationText = screen.getByText((content) => content.includes('storySidebar.translation'));
    const card = translationText.closest('.bg-accent\\/50');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-accent/50');
  });

  it('displays target language section', () => {
    render(<InfoSection {...defaultProps} />);

    expect(screen.getByText('storySidebar.targetLanguage')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.currentlySupported')).toBeInTheDocument();
  });

  it('displays target language badge', () => {
    render(<InfoSection {...defaultProps} />);

    const badge = screen.getByText('Spanish');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-sm');
  });

  it('displays difficulty level section with CEFR label', () => {
    render(<InfoSection {...defaultProps} />);

    // Check for difficulty level text that may be split across elements
    const difficultyText = screen.getByText((content) => content.includes('storySidebar.difficultyLevel'));
    expect(difficultyText).toBeInTheDocument();

    // Check for CEFR text that may be part of the label
    const cefrText = screen.getByText((content) => content.includes('(CEFR)'));
    expect(cefrText).toBeInTheDocument();
    expect(screen.getByText('storySidebar.storyAdaptedToLevel')).toBeInTheDocument();
  });

  it('displays difficulty badge with correct styling', () => {
    render(<InfoSection {...defaultProps} />);

    const badge = screen.getByText('A1');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-sm');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('calls getDifficultyColor and getDifficultyLabel with correct difficulty', () => {
    render(<InfoSection {...defaultProps} />);

    expect(mockGetDifficultyColor).toHaveBeenCalledWith('a1');
    expect(mockGetDifficultyLabel).toHaveBeenCalledWith('a1');
  });

  it('handles different difficulty levels correctly', () => {
    const testCases: Array<{ difficulty: DifficultyLevel; expectedColor: string; expectedLabel: string }> = [
      { difficulty: 'a1', expectedColor: 'bg-green-100 text-green-800', expectedLabel: 'A1' },
      { difficulty: 'a2', expectedColor: 'bg-blue-100 text-blue-800', expectedLabel: 'A2' },
      { difficulty: 'b1', expectedColor: 'bg-yellow-100 text-yellow-800', expectedLabel: 'B1' },
      { difficulty: 'b2', expectedColor: 'bg-purple-100 text-purple-800', expectedLabel: 'B2' },
    ];

    testCases.forEach(({ difficulty, expectedColor, expectedLabel }) => {
      const translationDataWithDifficulty = {
        ...mockTranslationData,
        difficulty,
      };

      render(
        <InfoSection
          {...defaultProps}
          translationData={translationDataWithDifficulty}
        />
      );

      const badge = screen.getByText(expectedLabel);
      expect(badge).toHaveClass(...expectedColor.split(' '));
    });
  });

  it('handles different language combinations', () => {
    const languageTestCases = [
      { from: 'en' as LanguageCode, to: 'fr' as LanguageCode, expected: 'English → French' },
      { from: 'de' as LanguageCode, to: 'it' as LanguageCode, expected: 'German → Italian' },
      { from: 'ja' as LanguageCode, to: 'ko' as LanguageCode, expected: 'Japanese → Korean' },
    ];

    languageTestCases.forEach(({ from, to, expected }) => {
      const translationDataWithLanguages = {
        ...mockTranslationData,
        fromLanguage: from,
        toLanguage: to,
      };

      render(
        <InfoSection
          {...defaultProps}
          translationData={translationDataWithLanguages}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it('applies correct spacing and layout classes', () => {
    render(<InfoSection {...defaultProps} />);

    // Check main container
    const mainContainer = screen.getByText('storySidebar.storyOptions').closest('.p-4');
    expect(mainContainer).toHaveClass('p-4', 'space-y-6');

    // Check border styling
    const headerSection = screen.getByText('storySidebar.storyOptions').closest('.border-b');
    expect(headerSection).toHaveClass('border-b', 'pb-4');
  });

  it('handles translation function calls correctly', () => {
    render(<InfoSection {...defaultProps} />);

    // Verify all expected translation keys are called
    expect(mockT).toHaveBeenCalledWith('storySidebar.storyOptions');
    expect(mockT).toHaveBeenCalledWith('storySidebar.currentSettings');
    expect(mockT).toHaveBeenCalledWith('storySidebar.translation');
    expect(mockT).toHaveBeenCalledWith('storySidebar.optionsEditing');
    expect(mockT).toHaveBeenCalledWith('storySidebar.targetLanguage');
    expect(mockT).toHaveBeenCalledWith('storySidebar.currentlySupported');
    expect(mockT).toHaveBeenCalledWith('storySidebar.difficultyLevel');
    expect(mockT).toHaveBeenCalledWith('storySidebar.storyAdaptedToLevel');
  });

  it('renders all sections in correct order', () => {
    render(<InfoSection {...defaultProps} />);

    const container = screen.getByText('storySidebar.storyOptions').closest('.p-4');
    expect(container).toBeInTheDocument();

    // Check that sections are rendered in the expected order
    const sections = container?.querySelectorAll('.space-y-2');
    expect(sections).toHaveLength(2); // Target language and difficulty sections
  });

  it('handles unknown language codes gracefully', () => {
    mockGetLanguageName.mockReturnValue('unknown');

    const translationDataWithUnknownLanguage = {
      ...mockTranslationData,
      fromLanguage: 'xx' as LanguageCode,
      toLanguage: 'yy' as LanguageCode,
    };

    render(
      <InfoSection
        {...defaultProps}
        translationData={translationDataWithUnknownLanguage}
      />
    );

    expect(screen.getByText('unknown → unknown')).toBeInTheDocument();
  });

  it('handles unknown difficulty levels gracefully', () => {
    mockGetDifficultyColor.mockReturnValue('bg-gray-100 text-gray-800');
    mockGetDifficultyLabel.mockReturnValue('UNKNOWN');

    const translationDataWithUnknownDifficulty = {
      ...mockTranslationData,
      difficulty: 'xx' as DifficultyLevel,
    };

    render(
      <InfoSection
        {...defaultProps}
        translationData={translationDataWithUnknownDifficulty}
      />
    );

    const badge = screen.getByText('UNKNOWN');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });
});
