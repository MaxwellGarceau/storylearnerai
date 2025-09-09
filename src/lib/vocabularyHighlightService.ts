/**
 * Service for managing vocabulary highlighting styles and colors
 * Encapsulates the logic for determining CSS classes based on vocabulary state
 */

export interface VocabularyHighlightState {
  isIncludedVocabulary: boolean;
  isSaved: boolean;
  isTranslating?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface VocabularyHighlightOptions {
  /** Whether to include accessibility improvements */
  accessible?: boolean;
  /** Custom theme variant */
  theme?: 'default' | 'high-contrast' | 'colorblind-friendly';
}

/**
 * Vocabulary highlighting service that provides CSS classes based on vocabulary state
 */
export class VocabularyHighlightService {
  private static readonly HIGHLIGHT_CLASSES = {
    included: {
      default: 'bg-green-200 dark:bg-green-900/40',
      highContrast: 'bg-green-300 dark:bg-green-800 border border-green-400',
      colorblindFriendly:
        'bg-emerald-200 dark:bg-emerald-900/40 border border-emerald-300',
    },
    saved: {
      default: 'bg-yellow-200 dark:bg-yellow-900/30',
      highContrast: 'bg-yellow-300 dark:bg-yellow-800 border border-yellow-400',
      colorblindFriendly:
        'bg-amber-200 dark:bg-amber-900/40 border border-amber-300',
    },
    translating: {
      default: 'bg-blue-200 dark:bg-blue-900/30',
      highContrast: 'bg-blue-300 dark:bg-blue-800 border border-blue-400',
      colorblindFriendly: 'bg-sky-200 dark:bg-sky-900/40 border border-sky-300',
    },
    active: {
      default: 'bg-purple-200 dark:bg-purple-900/40',
      highContrast: 'bg-purple-300 dark:bg-purple-800 border border-purple-400',
      colorblindFriendly:
        'bg-violet-200 dark:bg-violet-900/40 border border-violet-300',
    },
  } as const;

  /**
   * Get the appropriate CSS class for vocabulary highlighting based on state
   */
  static getHighlightClass(
    state: VocabularyHighlightState,
    options: VocabularyHighlightOptions = {}
  ): string {
    const { accessible = false, theme = 'default' } = options;

    // Priority order: included vocabulary > saved > translating > active
    if (state.isIncludedVocabulary) {
      return this.getThemeClass('included', theme, accessible);
    }

    if (state.isSaved) {
      return this.getThemeClass('saved', theme, accessible);
    }

    if (state.isTranslating) {
      return this.getThemeClass('translating', theme, accessible);
    }

    if (state.isActive) {
      return this.getThemeClass('active', theme, accessible);
    }

    return '';
  }

  /**
   * Get CSS class for a specific vocabulary state with theme support
   */
  private static getThemeClass(
    state: keyof typeof VocabularyHighlightService.HIGHLIGHT_CLASSES,
    theme: VocabularyHighlightOptions['theme'],
    accessible: boolean
  ): string {
    // Map theme names to object keys
    const themeKey =
      theme === 'high-contrast'
        ? 'highContrast'
        : theme === 'colorblind-friendly'
          ? 'colorblindFriendly'
          : 'default';

    const baseClass = this.HIGHLIGHT_CLASSES[state][themeKey];

    if (accessible) {
      // Add accessibility improvements
      return `${baseClass} focus:ring-2 focus:ring-offset-2 focus:ring-current`;
    }

    return baseClass;
  }
}

/**
 * Convenience function for getting vocabulary highlight class
 * @param state - The vocabulary state
 * @param options - Highlighting options
 * @returns CSS class string
 */
export function getVocabularyHighlightClass(
  state: VocabularyHighlightState,
  options?: VocabularyHighlightOptions
): string {
  return VocabularyHighlightService.getHighlightClass(state, options);
}
