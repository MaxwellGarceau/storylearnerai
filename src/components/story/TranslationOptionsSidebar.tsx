import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select';
import { ChevronDown, Settings } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Label from '../ui/Label';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import type { LanguageCode, DifficultyLevel } from '../../lib/types/prompt';

interface TranslationOptionsSidebarProps {
  formData: {
    language: LanguageCode;
    difficulty: DifficultyLevel;
  };
  onFormDataChange: (field: 'language' | 'difficulty', value: LanguageCode | DifficultyLevel) => void;
}

const TranslationOptionsSidebar: React.FC<TranslationOptionsSidebarProps> = ({
  formData,
  onFormDataChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  const handleSelectChange = (field: 'language' | 'difficulty', value: string) => {
    if (field === 'language') {
      onFormDataChange(field, value as LanguageCode);
    } else {
      onFormDataChange(field, value as DifficultyLevel);
    }
  };

  const handleLanguageOpenChange = (open: boolean) => {
    setLanguageOpen(open);
  };

  const handleDifficultyOpenChange = (open: boolean) => {
    setDifficultyOpen(open);
  };

  return (
    <div className="fixed top-28 right-4 z-50" data-testid="translation-options">
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-md p-3 text-sm font-medium transition-all duration-200 shadow-lg",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={isOpen ? 'Close translation options' : 'Open translation options'}
            data-testid="translation-options-button"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Options</span>
          </button>
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
              maxHeight: 'calc(100vh - 140px)' // Account for top-28 (112px) + 16px collision padding + 12px sideOffset
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
                <h3 className="text-lg font-semibold text-foreground">Translation Options</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure your translation settings</p>
              </div>

              {/* Info Box */}
              <Card variant="outline" className="bg-accent/50">
                <CardContent className="p-3">
                  <p className="text-sm text-accent-foreground">
                    <strong>Translation:</strong> Spanish → English
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your Spanish story in the main text area, and it will be translated to English at your selected difficulty level.
                  </p>
                </CardContent>
              </Card>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="sidebar-language">
                  Target Language
                </Label>
                <Select
                  name="sidebar-language"
                  value={formData.language}
                  onValueChange={(value) => handleSelectChange('language', value)}
                  onOpenChange={handleLanguageOpenChange}
                >
                  <SelectTrigger
                    id="sidebar-language"
                    aria-label="Select target language"
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <span className="text-foreground">{formData.language === 'en' ? 'English' : 'Spanish'}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 opacity-50 transition-transform duration-200",
                      languageOpen && "rotate-180"
                    )} />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  )}>
                    <SelectItem 
                      value="en"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Currently only English translation is supported.
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label htmlFor="sidebar-difficulty">
                  Target Difficulty (CEFR)
                </Label>
                <Select
                  name="sidebar-difficulty"
                  value={formData.difficulty}
                  onValueChange={(value) => handleSelectChange('difficulty', value)}
                  onOpenChange={handleDifficultyOpenChange}
                >
                  <SelectTrigger
                    id="sidebar-difficulty"
                    aria-label="Select difficulty level"
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <span className="text-foreground">
                      {formData.difficulty === 'a1' ? 'A1 (Beginner)' :
                        formData.difficulty === 'a2' ? 'A2 (Elementary)' :
                          formData.difficulty === 'b1' ? 'B1 (Intermediate)' :
                            formData.difficulty === 'b2' ? 'B2 (Upper Intermediate)' : formData.difficulty}
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 opacity-50 transition-transform duration-200",
                      difficultyOpen && "rotate-180"
                    )} />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  )}>
                    <SelectItem 
                      value="a1"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      A1 (Beginner)
                    </SelectItem>
                    <SelectItem 
                      value="a2"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      A2 (Elementary)
                    </SelectItem>
                    <SelectItem 
                      value="b1"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      B1 (Intermediate)
                    </SelectItem>
                    <SelectItem 
                      value="b2"
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      B2 (Upper Intermediate)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mb-6">
                  The story will be adapted to this English proficiency level.
                </p>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default TranslationOptionsSidebar; 