import React from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface StoryRenderProps {
  translationData: TranslationResponse;
}

const StoryRender: React.FC<StoryRenderProps> = ({ translationData }) => {
  if (!translationData) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Original Spanish Story */}
      <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">
          Original Story (Spanish):
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap">{translationData.originalText}</p>
      </div>

      {/* Translated English Story */}
      <div className="p-4 border rounded-md bg-green-50 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-green-800">
            Translated Story (English):
          </h3>
          <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
            {translationData.difficulty} Level
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{translationData.translatedText}</p>
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
