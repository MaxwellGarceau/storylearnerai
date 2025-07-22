import React from 'react';
import { Button } from '../ui/Button';

interface FullPageStoryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isTranslating: boolean;
  placeholder?: string;
}

const FullPageStoryInput: React.FC<FullPageStoryInputProps> = ({
  value,
  onChange,
  onSubmit,
  isTranslating,
  placeholder = "Ingresa tu historia en español aquí... (Enter your Spanish story here...)"
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Translate Your Story</h1>
        <p className="text-muted-foreground text-lg">
          Enter a story in Spanish and we'll translate it to English
        </p>
      </div>

      {/* Full-page text area */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-background border border-border rounded-lg shadow-sm">
          <textarea
            id="fullpage-story-input"
            name="fullpage-story-input"
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
        </div>
      </div>

      {/* Action area with button and tip */}
      <div className="mt-6 space-y-4">
        {/* Translate Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isTranslating || !value.trim()}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
          >
            {isTranslating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" role="status" aria-label="Loading"></div>
                <span>Translating...</span>
              </div>
            ) : (
              'Translate Story'
            )}
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-sm text-muted-foreground text-center">
          <p>
            💡 Tip: You can paste long stories, articles, or any Spanish text you'd like to translate
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullPageStoryInput; 