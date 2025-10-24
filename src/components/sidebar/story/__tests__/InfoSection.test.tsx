import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InfoSection from '../InfoSection';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockTranslationData,
  mockTranslationDataNoVocabulary,
  mockTranslationDataAllIncluded,
  mockT,
} from '../../__tests__/sidebarMocks';
import type {
  DifficultyLevel,
  LanguageCode,
} from '../../../../types/llm/prompts';

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
    expect(
      screen.getByText('storySidebar.currentSettings')
    ).toBeInTheDocument();
  });

  it('displays translation information correctly', () => {
    render(<InfoSection {...defaultProps} />);

    expect(mockGetLanguageName).toHaveBeenCalledWith('en');
    expect(mockGetLanguageName).toHaveBeenCalledWith('es');

    // Check for the translation text within the strong element
    const translationText = screen.getByText(content =>
      content.includes('storySidebar.translation')
    );
    expect(translationText).toBeInTheDocument();
    expect(screen.getByText('English → Spanish')).toBeInTheDocument();
    expect(screen.getByText('storySidebar.optionsEditing')).toBeInTheDocument();
  });

  it('renders translation card with correct styling', () => {
    render(<InfoSection {...defaultProps} />);

    const translationText = screen.getByText(content =>
      content.includes('storySidebar.translation')
    );
    const card = translationText.closest('.bg-accent\\/50');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-accent/50');
  });

  it('displays target language section', () => {
    render(<InfoSection {...defaultProps} />);

    expect(screen.getByText('storySidebar.targetLanguage')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(
      screen.getByText('storySidebar.currentlySupported')
    ).toBeInTheDocument();
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
    const difficultyText = screen.getByText(content =>
      content.includes('storySidebar.difficultyLevel')
    );
    expect(difficultyText).toBeInTheDocument();

    // Check for CEFR text that may be part of the label
    const cefrText = screen.getByText(content => content.includes('(CEFR)'));
    expect(cefrText).toBeInTheDocument();
    expect(
      screen.getByText('storySidebar.storyAdaptedToLevel')
    ).toBeInTheDocument();
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
    const testCases: Array<{
      difficulty: DifficultyLevel;
      expectedColor: string;
      expectedLabel: string;
    }> = [
      {
        difficulty: 'a1',
        expectedColor: 'bg-green-100 text-green-800',
        expectedLabel: 'A1',
      },
      {
        difficulty: 'a2',
        expectedColor: 'bg-blue-100 text-blue-800',
        expectedLabel: 'A2',
      },
      {
        difficulty: 'b1',
        expectedColor: 'bg-yellow-100 text-yellow-800',
        expectedLabel: 'B1',
      },
      {
        difficulty: 'b2',
        expectedColor: 'bg-purple-100 text-purple-800',
        expectedLabel: 'B2',
      },
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
      {
        from: 'en' as LanguageCode,
        to: 'fr' as LanguageCode,
        expected: 'English → French',
      },
      {
        from: 'de' as LanguageCode,
        to: 'it' as LanguageCode,
        expected: 'German → Italian',
      },
      {
        from: 'ja' as LanguageCode,
        to: 'ko' as LanguageCode,
        expected: 'Japanese → Korean',
      },
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
    const mainContainer = screen
      .getByText('storySidebar.storyOptions')
      .closest('.p-4');
    expect(mainContainer).toHaveClass('p-4', 'space-y-6');

    // Check border styling
    const headerSection = screen
      .getByText('storySidebar.storyOptions')
      .closest('.border-b');
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

    const container = screen
      .getByText('storySidebar.storyOptions')
      .closest('.p-4');
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

  // Vocabulary Display Tests
  describe('Vocabulary Display', () => {
    it('displays vocabulary section when vocabulary is selected', () => {
      render(<InfoSection {...defaultProps} />);

      expect(
        screen.getByText('storySidebar.vocabularySection')
      ).toBeInTheDocument();
      expect(
        screen.getByText('storySidebar.includedVocabulary')
      ).toBeInTheDocument();
      expect(
        screen.getByText('storySidebar.missingVocabulary')
      ).toBeInTheDocument();
    });

    it('displays included vocabulary words as badges', () => {
      render(<InfoSection {...defaultProps} />);

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();

      const includedBadges = screen.getAllByText(/hello|world/);
      includedBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('displays missing vocabulary words as badges', () => {
      render(<InfoSection {...defaultProps} />);

      expect(screen.getByText('good')).toBeInTheDocument();
      expect(screen.getByText('morning')).toBeInTheDocument();

      const missingBadges = screen.getAllByText(/good|morning/);
      missingBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-amber-100', 'text-amber-800');
      });
    });

    it('displays vocabulary summary with correct counts', () => {
      render(<InfoSection {...defaultProps} />);

      // Check for the text that contains the translation keys using getAllByText
      const totalSelectedElements = screen.getAllByText((_, element) => {
        return (
          element?.textContent?.includes('storySidebar.totalSelected') ?? false
        );
      });
      expect(totalSelectedElements.length).toBeGreaterThan(0);
      expect(screen.getByText('4')).toBeInTheDocument(); // selectedVocabulary.length

      const totalIncludedElements = screen.getAllByText((_, element) => {
        return (
          element?.textContent?.includes('storySidebar.totalIncluded') ?? false
        );
      });
      expect(totalIncludedElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText('2')).toHaveLength(2); // includedVocabulary.length and missingVocabulary.length

      const totalMissingElements = screen.getAllByText((_, element) => {
        return (
          element?.textContent?.includes('storySidebar.totalMissing') ?? false
        );
      });
      expect(totalMissingElements.length).toBeGreaterThan(0);
      // We already checked for 2 elements with "2" text above
    });

    it('displays CheckCircle icon for included vocabulary', () => {
      render(<InfoSection {...defaultProps} />);

      const checkIcon = document.querySelector('.lucide-circle-check-big');
      expect(checkIcon).toBeInTheDocument();
    });

    it('displays AlertTriangle icon for missing vocabulary', () => {
      render(<InfoSection {...defaultProps} />);

      const alertIcon = document.querySelector('.lucide-triangle-alert');
      expect(alertIcon).toBeInTheDocument();
    });

    it('displays vocabulary descriptions', () => {
      render(<InfoSection {...defaultProps} />);

      expect(
        screen.getByText('storySidebar.includedVocabularyDescription')
      ).toBeInTheDocument();
      expect(
        screen.getByText('storySidebar.missingVocabularyDescription')
      ).toBeInTheDocument();
    });

    it('handles case when no vocabulary is selected', () => {
      const propsNoVocabulary = {
        ...defaultProps,
        translationData: mockTranslationDataNoVocabulary,
      };

      render(<InfoSection {...propsNoVocabulary} />);

      expect(
        screen.getByText('storySidebar.noVocabularySelected')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('storySidebar.vocabularySection')
      ).not.toBeInTheDocument();
    });

    it('handles case when all vocabulary is included', () => {
      const propsAllIncluded = {
        ...defaultProps,
        translationData: mockTranslationDataAllIncluded,
      };

      render(<InfoSection {...propsAllIncluded} />);

      expect(
        screen.getByText('storySidebar.vocabularySection')
      ).toBeInTheDocument();
      expect(
        screen.getByText('storySidebar.includedVocabulary')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('storySidebar.missingVocabulary')
      ).not.toBeInTheDocument();

      // Check that missing vocabulary count is 0
      const missingCount = screen.getByText('0');
      expect(missingCount).toBeInTheDocument();
    });

    it('handles case when no vocabulary is included', () => {
      const translationDataNoIncluded = {
        ...mockTranslationData,
        includedVocabulary: [],
        missingVocabulary: ['hello', 'world', 'good', 'morning'],
      };

      const propsNoIncluded = {
        ...defaultProps,
        translationData: translationDataNoIncluded,
      };

      render(<InfoSection {...propsNoIncluded} />);

      expect(
        screen.getByText('storySidebar.vocabularySection')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('storySidebar.includedVocabulary')
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('storySidebar.missingVocabulary')
      ).toBeInTheDocument();

      // Check that included vocabulary count is 0
      const includedCount = screen.getByText('0');
      expect(includedCount).toBeInTheDocument();
    });

    it('applies correct styling to vocabulary cards', () => {
      render(<InfoSection {...defaultProps} />);

      // Check included vocabulary card
      const includedCard = screen
        .getByText('storySidebar.includedVocabulary')
        .closest('.mb-4');
      expect(includedCard).toBeInTheDocument();

      // Check missing vocabulary card
      const missingCard = screen
        .getByText('storySidebar.missingVocabulary')
        .closest('.mb-4');
      expect(missingCard).toBeInTheDocument();

      // Check summary card - look for the text that contains "totalSelected"
      const summaryTexts = screen.getAllByText((_, element) => {
        return (
          element?.textContent?.includes('storySidebar.totalSelected') ?? false
        );
      });
      expect(summaryTexts.length).toBeGreaterThan(0);

      // Check that the summary text exists
      const summaryElement = summaryTexts[0];
      expect(summaryElement).toBeInTheDocument();
    });

    it('calls translation function for vocabulary-related keys', () => {
      render(<InfoSection {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('storySidebar.vocabularySection');
      expect(mockT).toHaveBeenCalledWith('storySidebar.includedVocabulary');
      expect(mockT).toHaveBeenCalledWith('storySidebar.missingVocabulary');
      expect(mockT).toHaveBeenCalledWith('storySidebar.totalSelected');
      expect(mockT).toHaveBeenCalledWith('storySidebar.totalIncluded');
      expect(mockT).toHaveBeenCalledWith('storySidebar.totalMissing');
      expect(mockT).toHaveBeenCalledWith(
        'storySidebar.includedVocabularyDescription'
      );
      expect(mockT).toHaveBeenCalledWith(
        'storySidebar.missingVocabularyDescription'
      );
    });
  });
});
