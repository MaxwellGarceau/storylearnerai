import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Settings, Check, X } from 'lucide-react';
import { useLanguages } from '../../hooks/useLanguages';
import { validateStoryText } from '../../lib/utils/sanitization';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';

interface FullPageStoryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isTranslating: boolean;
  placeholder?: string;
  formData: {
    language: LanguageCode;
    difficulty: DifficultyLevel;
  };
  onFormDataChange: (field: 'language' | 'difficulty', value: LanguageCode | DifficultyLevel) => void;
}

const FullPageStoryInput: React.FC<FullPageStoryInputProps> = ({
  value,
  onChange,
  onSubmit,
  isTranslating,
  placeholder = "Ingresa tu historia en español aquí... (Enter your Spanish story here...)",
  formData,
  onFormDataChange
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { getLanguageName } = useLanguages();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = event.target.value;
    
    // Validate and sanitize the input
    const validation = validateStoryText(rawValue);
    
    if (validation.isValid) {
      setValidationError(null);
      // Use the sanitized text
      onChange(validation.sanitizedText);
    } else {
      // Show validation error but still allow editing
      setValidationError(validation.errors[0] || 'Invalid input detected');
      // Still update with sanitized text to prevent malicious content
      onChange(validation.sanitizedText);
    }
  };

  const handleTranslateClick = () => {
    // Final validation before translation
    const validation = validateStoryText(value);
    
    if (!validation.isValid) {
      setValidationError(validation.errors[0] || 'Please fix the input before translating');
      return;
    }
    
    setValidationError(null);
    setShowConfirmation(true);
  };

  const handleConfirmTranslation = () => {
    setShowConfirmation(false);
    onSubmit();
  };

  const handleCancelTranslation = () => {
    setShowConfirmation(false);
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'a1': return 'A1 (Beginner)';
      case 'a2': return 'A2 (Elementary)';
      case 'b1': return 'B1 (Intermediate)';
      case 'b2': return 'B2 (Upper Intermediate)';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Translate Your Story</h2>
        <p className="text-muted-foreground text-lg">
          Enter a story in Spanish and we'll translate it to English
        </p>
      </div>

      {/* Full-page text area */}
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <textarea
              id="fullpage-story-input"
              name="fullpage-story-input"
              data-testid="story-textarea"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full h-full min-h-[calc(100vh-300px)] resize-none border-0 focus:ring-0 focus:border-0 p-6 text-lg leading-relaxed bg-transparent text-foreground placeholder:text-muted-foreground"
              style={{
                minHeight: 'calc(100vh - 300px)',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8',
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action area with buttons and tip */}
      <div className="mt-6 space-y-4">
        {/* Buttons */}
        <div className="flex justify-center items-center gap-4">
          {/* Options Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOptions(!showOptions)}
            size="lg"
            className="px-6 py-3 text-lg font-medium"
            data-testid="options-button"
          >
            <Settings className="w-5 h-5 mr-2" />
            Options
          </Button>

          {/* Translate Button */}
          <Button
            type="button"
            onClick={handleTranslateClick}
            disabled={isTranslating || !value.trim()}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
            data-testid="translate-button"
          >
            {isTranslating ? (
              <div className="flex items-center space-x-2">
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" 
                  role="status" 
                  aria-label="Loading"
                />
                <span>Translating...</span>
              </div>
            ) : (
              'Translate Story'
            )}
          </Button>
        </div>

        {/* Options Panel - Removed from here, now in floating modal */}

        {/* Validation Error */}
        {validationError && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-medium">⚠️ Security Warning</p>
            <p>{validationError}</p>
            <p className="text-xs mt-1">Malicious content has been automatically removed for your safety.</p>
          </div>
        )}

        {/* Footer info */}
        <div className="text-sm text-muted-foreground text-center">
          <p>
            💡 Tip: You can paste long stories, articles, or any Spanish text you'd like to translate
          </p>
        </div>
      </div>

      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Translation Options</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => onFormDataChange('language', e.target.value as LanguageCode)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="en">{getLanguageName('en')}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Currently only {getLanguageName('en')} translation is supported.
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Difficulty (CEFR)</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => onFormDataChange('difficulty', e.target.value as DifficultyLevel)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="a1">A1 (Beginner)</option>
                  <option value="a2">A2 (Elementary)</option>
                  <option value="b1">B1 (Intermediate)</option>
                  <option value="b2">B2 (Upper Intermediate)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  The story will be adapted to this {getLanguageName('en')} proficiency level.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowOptions(false)}
                className="px-6"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Translation Options</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium">{getLanguageName('es')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{getLanguageName(formData.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">{getDifficultyLabel(formData.difficulty)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancelTranslation}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTranslation}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm & Translate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPageStoryInput; 