import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Button } from '../ui/Button';
import Label from '../ui/Label';

interface TranslationOptionsSidebarProps {
  formData: {
    language: string;
    difficulty: string;
  };
  onFormDataChange: (field: 'language' | 'difficulty', value: string) => void;
  onSubmit: () => void;
  isTranslating: boolean;
}

const TranslationOptionsSidebar: React.FC<TranslationOptionsSidebarProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  isTranslating,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = (field: 'language' | 'difficulty', value: string) => {
    onFormDataChange(field, value);
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Sidebar Panel */}
      <div
        className={`absolute right-0 top-12 w-80 bg-white shadow-xl rounded-lg border transition-all duration-200 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
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
          <div>
            <Label htmlFor="sidebar-language">Target Language</Label>
            <Select
              name="sidebar-language"
              value={formData.language}
              onValueChange={(value) => handleSelectChange('language', value)}
            >
              <SelectTrigger
                id="sidebar-language"
                aria-label="Select target language"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
              >
                {formData.language}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Currently only English translation is supported.
            </p>
          </div>

          {/* Difficulty Selection */}
          <div>
            <Label htmlFor="sidebar-difficulty">Target Difficulty (CEFR)</Label>
            <Select
              name="sidebar-difficulty"
              value={formData.difficulty}
              onValueChange={(value) => handleSelectChange('difficulty', value)}
            >
              <SelectTrigger
                id="sidebar-difficulty"
                aria-label="Select difficulty level"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
              >
                {formData.difficulty}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 (Beginner)</SelectItem>
                <SelectItem value="A2">A2 (Elementary)</SelectItem>
                <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              The story will be adapted to this English proficiency level.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isTranslating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md focus:ring focus:ring-indigo-300"
          >
            {isTranslating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" role="status" aria-label="Loading"></div>
                <span>Translating...</span>
              </div>
            ) : (
              'Translate Story'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranslationOptionsSidebar; 