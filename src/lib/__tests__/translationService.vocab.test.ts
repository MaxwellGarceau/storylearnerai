import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests in this file were added by the assistant.

// Mock dependencies before importing translationService
vi.mock('../llm/LLMServiceManager', () => ({
  llmServiceManager: {
    generateCompletion: vi.fn(),
    getProvider: vi.fn(),
    getModel: vi.fn(),
  },
}));

vi.mock('../config/env', () => ({
  EnvironmentConfig: {
    isMockTranslationEnabled: vi.fn(),
  },
}));

// Import after mocking
import { translationService } from '../translationService';
import { llmServiceManager } from '../llm/LLMServiceManager';
import { EnvironmentConfig } from '../config/env';

describe('translationService vocabulary inclusion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes selectedVocabulary analysis in translateStory results', async () => {
    vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
      false
    );
    vi.mocked(llmServiceManager.generateCompletion).mockResolvedValue({
      content: 'An apple a day keeps the doctor away. I like banana splits.',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
    } as unknown as Awaited<
      ReturnType<typeof llmServiceManager.generateCompletion>
    >);

    const result = await translationService.translate({
      text: 'Texto de ejemplo',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      selectedVocabulary: ['apple', 'cherry'],
    });

    expect(result.selectedVocabulary).toEqual(['apple', 'cherry']);
    expect(result.includedVocabulary).toEqual(['apple']);
    expect(result.missingVocabulary).toEqual(['cherry']);
  });

  it('handles regex characters in selectedVocabulary safely (no false positives)', async () => {
    vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
      false
    );
    vi.mocked(llmServiceManager.generateCompletion).mockResolvedValue({
      content: 'C++ is a powerful language. I also enjoy C.',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
    } as unknown as Awaited<
      ReturnType<typeof llmServiceManager.generateCompletion>
    >);

    const result = await translationService.translate({
      text: 'Texto de ejemplo',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'b1',
      selectedVocabulary: ['C++', 'Java'],
    });

    // Since punctuation is stripped from the target text for word matching,
    // 'C++' should NOT be counted as included, and no errors should occur.
    expect(result.includedVocabulary).not.toContain('C++');
    expect(result.missingVocabulary).toContain('C++');
    expect(result.missingVocabulary).toContain('Java');
  });

  it('returns empty arrays when no selectedVocabulary provided', async () => {
    vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
      false
    );
    vi.mocked(llmServiceManager.generateCompletion).mockResolvedValue({
      content: 'Translation output',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
    } as unknown as Awaited<
      ReturnType<typeof llmServiceManager.generateCompletion>
    >);

    const result = await translationService.translate({
      text: 'Texto de ejemplo',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a2',
    });

    expect(result.selectedVocabulary).toEqual([]);
    expect(result.includedVocabulary).toEqual([]);
    expect(result.missingVocabulary).toEqual([]);
  });

  it('mockTranslateStory echoes selection and simulates inclusion mapping', async () => {
    vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(true);

    const result = await translationService.translate({
      text: 'Texto',
      fromLanguage: 'es',
      toLanguage: 'en',
      difficulty: 'a1',
      selectedVocabulary: ['alpha', 'beta', 'gamma'],
    });

    expect(result.selectedVocabulary).toEqual(['alpha', 'beta', 'gamma']);
    expect(result.includedVocabulary).toEqual(['alpha']);
    expect(result.missingVocabulary).toEqual(['beta', 'gamma']);
  });
});
