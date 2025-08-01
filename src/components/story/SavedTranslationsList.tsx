import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { useSavedTranslations } from '../../hooks/useSavedTranslations';
import { DatabaseSavedTranslationWithDetails } from '../../types/database';
import { TranslationResponse } from '../../lib/translationService';
import { DifficultyLevel, DifficultyLevelDisplay, LanguageCode } from '../../types/llm/prompts';
import { logger } from '../../lib/logger';

// CEFR difficulty level options
const CEFR_DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: DifficultyLevelDisplay; description: string }[] = [
  { value: 'a1', label: 'A1 (Beginner)', description: 'Basic level - Can understand and use familiar everyday expressions' },
  { value: 'a2', label: 'A2 (Elementary)', description: 'Elementary level - Can communicate in simple and routine tasks' },
  { value: 'b1', label: 'B1 (Intermediate)', description: 'Intermediate level - Can deal with most situations while traveling' },
  { value: 'b2', label: 'B2 (Upper Intermediate)', description: 'Upper intermediate level - Can interact with fluency and spontaneity' },
];

export default function SavedTranslationsList() {
  const navigate = useNavigate();
  const {
    savedTranslations,
    languages,
    isLoading,
    isDeleting,
    error,
    deleteSavedTranslation,
    setFilters,
    hasMore,
    loadMore,
    totalCount,
  } = useSavedTranslations();

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = () => {
    setFilters({
      translated_language_code: (selectedLanguage || undefined) as LanguageCode | undefined,
      difficulty_level_code: (selectedDifficulty || undefined) as DifficultyLevel | undefined,
      search: searchTerm.trim() || undefined,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this saved translation?')) {
      try {
        await deleteSavedTranslation(id);
      } catch (err) {
        logger.error('ui', 'Failed to delete translation', { error: err });
      }
    }
  };

  const convertToTranslationResponse = (savedTranslation: DatabaseSavedTranslationWithDetails): TranslationResponse => {
    return {
      originalText: savedTranslation.original_story,
      translatedText: savedTranslation.translated_story,
      fromLanguage: savedTranslation.original_language.code as LanguageCode,
      toLanguage: savedTranslation.translated_language.code as LanguageCode,
      difficulty: savedTranslation.difficulty_level.code as DifficultyLevel,
      provider: 'saved',
      model: 'saved-translation',
    };
  };

  const handleViewStory = (savedTranslation: DatabaseSavedTranslationWithDetails) => {
    const translationData = convertToTranslationResponse(savedTranslation);
    navigate('/story', { 
      state: { 
        translationData,
        isSavedStory: true,
        savedTranslationId: savedTranslation.id 
      } 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && savedTranslations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading saved translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter your saved translations by target language, difficulty, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Language</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode | '')}
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level (CEFR)</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | '')}
              >
                <option value="">All Levels</option>
                {CEFR_DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search in titles, notes, or content..."
                className="w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleFilterChange} className="w-full md:w-auto">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertIcon.destructive className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalCount} saved translation{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Translations List */}
      <div className="space-y-4">
        {savedTranslations.map((translation) => (
          <Card 
            key={translation.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewStory(translation)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {translation.title || 'Untitled Translation'}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(translation.created_at)} •{' '}
                    {translation.original_language.name} → {translation.translated_language.name}
                  </CardDescription>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Badge variant="secondary">{translation.difficulty_level.name}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStory(translation)}
                  >
                    View Story
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(translation.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {translation.notes && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{translation.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Original Story</h4>
                  <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto border rounded p-2">
                    {translation.original_story}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Translated Story</h4>
                  <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto border rounded p-2">
                    {translation.translated_story}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && savedTranslations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              <svg
                className="h-12 w-12 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">No saved translations yet</h3>
              <p className="text-sm">
                Start translating stories and save them to see them here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 