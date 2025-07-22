import React, { useState } from 'react';
import { TranslationResponse } from '../../lib/translationService';
import * as Popover from '@radix-ui/react-popover';
import TranslationInfoContent from './TranslationInfoContent';
import { InfoButton } from '../ui/InfoButton';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface StoryHeaderProps {
  translationData: TranslationResponse;
  showOriginal: boolean;
  onToggleView: () => void;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({
  translationData,
  showOriginal,
  onToggleView
}) => {
  const [showTranslationInfo, setShowTranslationInfo] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-2 mb-4">
      <h3 className={`text-lg font-semibold transition-colors duration-300 lg:flex-shrink-0 ${
        showOriginal ? 'text-muted-foreground' : 'text-foreground'
      }`}>
        {showOriginal 
          ? 'Original Story (Spanish):' 
          : 'Translated Story (English):'
        }
      </h3>
      
      <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-2 sm:gap-3 lg:gap-2 flex-wrap relative">
        {!showOriginal && (
          <>
            <Badge 
              variant="success"
              className="order-1 sm:order-2"
            >
              {translationData.difficulty} Level
            </Badge>
          </>
        )}
        
        <Button
          onClick={onToggleView}
          variant={showOriginal ? "secondary" : "default"}
          size="default"
          className="order-3"
        >
          {showOriginal ? 'Show translated story' : 'Show original story'}
        </Button>
      </div>
    </div>
  );
};

export default StoryHeader; 