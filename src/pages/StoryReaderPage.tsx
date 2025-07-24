import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TranslationResponse } from '../lib/translationService';
import * as Popover from '@radix-ui/react-popover';
import { Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import Label from '../components/ui/Label';
import SaveTranslationButton from '../components/story/SaveTranslationButton';

const StoryReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const translationData = location.state?.translationData as TranslationResponse | undefined;
  const isSavedStory = location.state?.isSavedStory as boolean | undefined;
  // const savedTranslationId = location.state?.savedTranslationId as string | undefined;
  const [showOptions, setShowOptions] = useState(false);

  const handleTranslateAnother = () => {
    navigate('/translate');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // If no translation data is available, show a message
  if (!translationData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">No Story Found</h2>
            <p className="text-muted-foreground text-lg">Please translate a story first to view it here.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleTranslateAnother}
              size="lg"
            >
              Translate a Story
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="secondary"
              size="lg"
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSavedStory ? 'Your Saved Story' : 'Your Translated Story'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isSavedStory 
              ? 'Reading your saved translation from your library' 
              : 'Enjoy reading your story in English!'
            }
          </p>
          {isSavedStory && (
            <div className="mt-2">
              <Badge variant="secondary">Saved Story</Badge>
            </div>
          )}
        </div>

        {/* Story Container with transparent background */}
        <div className="bg-transparent border border-border rounded-lg p-6 mb-8">
          <StoryRender translationData={translationData} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SaveTranslationButton
            translationData={translationData}
            originalStory={translationData.originalText || ''}
            originalLanguage="Spanish"
            translatedLanguage="English"
            difficultyLevel={translationData.difficulty}
            isSavedStory={isSavedStory}
          />
          <Button 
            onClick={handleTranslateAnother}
            size="lg"
          >
            Translate Another Story
          </Button>
          <Button 
            onClick={handleGoHome}
            variant="secondary"
            size="lg"
          >
            Home
          </Button>
        </div>

        {/* Options Sidebar */}
        <div className="fixed top-28 right-4 z-50">
          <Popover.Root open={showOptions} onOpenChange={setShowOptions}>
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                size="default"
                className={cn(
                  "inline-flex items-center gap-2 shadow-lg",
                  "bg-background/80 backdrop-blur-sm"
                )}
                aria-label={showOptions ? 'Close story options' : 'Open story options'}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Translation Info</span>
              </Button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className={cn(
                  "z-50 w-80 max-w-[calc(100vw-32px)] overflow-y-auto",
                  "bg-popover text-popover-foreground",
                  "rounded-md border shadow-md",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                )}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))',
                  maxHeight: 'calc(100vh - 140px)'
                }}
                side="bottom"
                align="end"
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={16}
              >
                <div className="p-6 pb-12 space-y-6">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-foreground">Story Options</h3>
                    <p className="text-sm text-muted-foreground mt-1">Current translation settings</p>
                  </div>

                  {/* Info Box */}
                  <Card variant="outline" className="bg-accent/50">
                    <CardContent className="p-3">
                      <p className="text-sm text-accent-foreground">
                        <strong>Translation:</strong> Spanish → English
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        These are the settings used for this translation. Options editing will be available in a future update.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Language Selection (Disabled) */}
                  <div className="space-y-2">
                    <Label htmlFor="story-language">
                      Target Language
                    </Label>
                    <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed">
                      <span className="text-foreground">{translationData.toLanguage || 'English'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently only English translation is supported.
                    </p>
                  </div>

                  {/* Difficulty Selection (Disabled) */}
                  <div className="space-y-2">
                    <Label htmlFor="story-difficulty">
                      Target Difficulty (CEFR)
                    </Label>
                    <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed">
                      <span className="text-foreground">{translationData.difficulty}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The story was adapted to this English proficiency level.
                    </p>
                  </div>

                  {/* Language Level Badge Display */}
                  <div className="space-y-2">
                    <Label htmlFor="current-level">Current Level</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">
                        {translationData.difficulty} Level
                      </Badge>
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
  );
};

export default StoryReaderPage; 