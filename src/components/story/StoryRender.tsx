import React, { useState } from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface StoryRenderProps {
  translationData: TranslationResponse;
}

const StoryRender: React.FC<StoryRenderProps> = ({ translationData }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!translationData) {
    return null;
  }

  const toggleStoryView = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Single Story Container - Toggleable */}
      <div className={`p-4 border rounded-md transition-all duration-300 ${
        showOriginal 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            showOriginal ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {showOriginal 
              ? 'Original Story (Spanish):' 
              : 'Translated Story (English):'
            }
          </h3>
          <div className="flex items-center space-x-2">
            {!showOriginal && (
              <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                {translationData.difficulty} Level
              </span>
            )}
            <button
              onClick={toggleStoryView}
              className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${
                showOriginal
                  ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
            >
              {showOriginal ? 'Show translated story' : 'Show original story'}
            </button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <p className="text-gray-700 whitespace-pre-wrap transition-opacity duration-300">
            {showOriginal ? translationData.originalText : translationData.translatedText}
          </p>
        </div>
      </div>

      {/* Translation Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            <strong>Translation:</strong> {translationData.fromLanguage} → {translationData.toLanguage}
          </span>
          <span>
            <strong>Difficulty Level:</strong> {translationData.difficulty} (CEFR)
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryRender;
