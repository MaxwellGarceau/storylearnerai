import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Menu, X, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import savedStoriesData from '../../data/savedStories.json';
import { useNavigate } from 'react-router-dom';
import { translationService } from '../../lib/translationService';
import type { DifficultyLevel } from '../../lib/types/prompt';
import type { SavedStory } from '../../types/savedStories';

interface SavedStoriesSidebarProps {
  className?: string;
}

const SavedStoriesSidebar: React.FC<SavedStoriesSidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const stories: SavedStory[] = savedStoriesData.stories as SavedStory[];

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
      // You could add a toast notification here for error handling
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
        <div className="fixed top-16 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="shadow-lg bg-background/80 backdrop-blur-sm"
            aria-label="Show saved stories"
          >
            <Menu className="w-4 h-4" />
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
                <h2 className="text-lg font-semibold">Saved Stories</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Close saved stories"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a story to read it
            </p>
          </div>

          {/* Stories List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Demo stories • Spanish to English
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedStoriesSidebar; 