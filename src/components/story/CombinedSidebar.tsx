import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { X, BookOpen, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import savedStoriesData from '../../data/savedStories.json';
import { useNavigate } from 'react-router-dom';
import { translationService } from '../../lib/translationService';
import type { DifficultyLevel } from '../../lib/types/prompt';
import type { SavedStory } from '../../types/savedStories';
import { useViewport } from '../../hooks/useViewport';
import { useLanguageDisplay } from '../../hooks/useLanguageDisplay';

import Label from '../ui/Label';
import { TranslationResponse } from '../../lib/translationService';

interface CombinedSidebarProps {
  className?: string;
  translationData?: TranslationResponse;
}

const CombinedSidebar: React.FC<CombinedSidebarProps> = ({ className, translationData }) => {
  const { isMobile } = useViewport();
  const { getLanguageName } = useLanguageDisplay();
  
  // Get initial state from localStorage or default based on screen size
  const getInitialSidebarState = (): boolean => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Default to closed on mobile, open on larger screens
      return !isMobile;
    } catch (error) {
      console.warn('Failed to read sidebar state from localStorage:', error);
      return !isMobile; // Default based on screen size if localStorage fails
    }
  };

  const [isOpen, setIsOpen] = useState(getInitialSidebarState);
  const [activeSection, setActiveSection] = useState<'stories' | 'info'>('stories');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const stories: SavedStory[] = savedStoriesData.stories as SavedStory[];

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [isOpen]);

  // Update sidebar state when viewport changes (e.g., screen resize, orientation change)
  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    // Only auto-adjust if no preference is saved
    if (saved === null) {
      setIsOpen(!isMobile);
    }
  }, [isMobile]);

  const handleStoryClick = async (story: SavedStory) => {
    setIsLoading(story.id);
    
    try {
      // Use the translation service to translate the story
      const response = await translationService.translate({
        text: story.originalText,
        fromLanguage: story.fromLanguage as 'es',
        toLanguage: story.toLanguage as 'en',
        difficulty: story.difficulty,
      });

      // Navigate to story page with the translated data
      navigate('/story', { 
        state: { 
          translationData: response,
          isSavedStory: true 
        } 
      });
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'a1': return 'bg-green-100 text-green-800';
      case 'a2': return 'bg-blue-100 text-blue-800';
      case 'b1': return 'bg-yellow-100 text-yellow-800';
      case 'b2': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    return difficulty.toUpperCase();
  };

  return (
    <>
      {/* Toggle Button - Fixed Position (only visible when sidebar is closed) */}
      {!isOpen && (
        <div className="fixed top-20 left-4 z-50">
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 shadow-lg bg-background/80 backdrop-blur-sm"
            aria-label="Open story library"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Story Library</span>
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-16 left-0 z-40 w-80 max-w-[calc(100vw-16px)] h-[calc(100vh-64px)]",
          "bg-background border-r shadow-lg transition-all duration-300",
          "overflow-hidden",
          isOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-full opacity-0 pointer-events-none",
          className
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Story Library</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Close story library"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Section Tabs */}
            <div className="flex gap-1 mt-3">
              <Button
                variant={activeSection === 'stories' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('stories')}
                className="flex-1"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Stories
              </Button>
              <Button
                variant={activeSection === 'info' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('info')}
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Info
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeSection === 'stories' && (
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Click on a story to read it
                </p>
                {stories.map((story) => (
                  <Card
                    key={story.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      "hover:border-primary/50 hover:bg-accent/50",
                      isLoading === story.id && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => handleStoryClick(story)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base leading-tight">
                          {story.title}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getDifficultyColor(story.difficulty))}
                        >
                          {getDifficultyLabel(story.difficulty)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.description}
                      </p>
                      {isLoading === story.id && (
                        <div className="mt-2 text-xs text-primary">
                          Loading story...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeSection === 'info' && translationData && (
              <div className="p-4 space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-foreground">Story Options</h3>
                  <p className="text-sm text-muted-foreground mt-1">Current translation settings</p>
                </div>

                {/* Info Box */}
                <Card variant="outline" className="bg-accent/50">
                  <CardContent className="p-3">
                    <p className="text-sm text-accent-foreground">
                      <strong>Translation:</strong> {getLanguageName(translationData.fromLanguage)} → {getLanguageName(translationData.toLanguage)}
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
                    <span className="text-foreground">{getLanguageName(translationData.toLanguage)}</span>
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
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-sm", getDifficultyColor(translationData.difficulty))}
                    >
                      {getDifficultyLabel(translationData.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The story was adapted to this English proficiency level.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'info' && !translationData && (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">
                  No translation data available to display.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              {activeSection === 'stories' ? 'Demo stories • Spanish to English' : 'Translation settings'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CombinedSidebar; 