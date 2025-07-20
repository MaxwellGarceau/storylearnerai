import React from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface TranslationInfoContentProps {
  translationData: TranslationResponse;
}

const TranslationInfoContent: React.FC<TranslationInfoContentProps> = ({
  translationData
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground mb-3">Translation Details</h4>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          <span><strong>From:</strong> {translationData.fromLanguage}</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          <span><strong>To:</strong> {translationData.toLanguage}</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          <span><strong>Difficulty Level:</strong> {translationData.difficulty} (CEFR)</span>
        </li>
      </ul>
    </div>
  );
};

export default TranslationInfoContent; 