import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Label from '../ui/Label';

interface TranslationOptionsSidebarProps {
  formData: {
    language: string;
    difficulty: string;
  };
  onFormDataChange: (field: 'language' | 'difficulty', value: string) => void;
}

const TranslationOptionsSidebar: React.FC<TranslationOptionsSidebarProps> = ({
  formData,
  onFormDataChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  const handleSelectChange = (field: 'language' | 'difficulty', value: string) => {
    onFormDataChange(field, value);
  };

  const handleLanguageOpenChange = (open: boolean) => {
    setLanguageOpen(open);
  };

  const handleDifficultyOpenChange = (open: boolean) => {
    setDifficultyOpen(open);
  };

  return (
    <div className="fixed top-28 right-4 z-50">
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2"
            aria-label={isOpen ? 'Close translation options' : 'Open translation options'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="hidden sm:inline">Options</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-80 max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] bg-white shadow-xl rounded-lg border outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}
            side="bottom"
            align="end"
            sideOffset={8}
            avoidCollisions={true}
            collisionPadding={16}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Translation Options</h3>
                <p className="text-sm text-gray-600 mt-1">Configure your translation settings</p>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Translation:</strong> Spanish → English
                </p>
                <p className="text-xs text-blue-600 mt-1">
              Enter your Spanish story in the main text area, and it will be translated to English at your selected difficulty level.
                </p>
              </div>

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
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-0 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span className="text-gray-900">{formData.language}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${languageOpen ? 'rotate-180' : ''}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[200px] animate-in slide-in-from-top-2 duration-200">
                    <SelectItem 
                      value="English"
                      className="px-3 py-2 rounded-md hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                  English
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
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
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-0 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span className="text-gray-900">{formData.difficulty}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${difficultyOpen ? 'rotate-180' : ''}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[200px] animate-in slide-in-from-top-2 duration-200">
                    <SelectItem 
                      value="A1"
                      className="px-3 py-2 rounded-md hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                  A1 (Beginner)
                    </SelectItem>
                    <SelectItem 
                      value="A2"
                      className="px-3 py-2 rounded-md hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                  A2 (Elementary)
                    </SelectItem>
                    <SelectItem 
                      value="B1"
                      className="px-3 py-2 rounded-md hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                  B1 (Intermediate)
                    </SelectItem>
                    <SelectItem 
                      value="B2"
                      className="px-3 py-2 rounded-md hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                  B2 (Upper Intermediate)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
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