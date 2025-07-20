import React, { useState } from 'react';
import { TranslationResponse } from '../../lib/translationService';
import * as Popover from '@radix-ui/react-popover';
import TranslationInfoContent from './TranslationInfoContent';
import { InfoButton } from '../ui/InfoButton';
import { InfoLabel } from '../ui/InfoLabel';

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
        showOriginal ? 'text-yellow-800' : 'text-green-800'
      }`}>
        {showOriginal 
          ? 'Original Story (Spanish):' 
          : 'Translated Story (English):'
        }
      </h3>
      
      <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-2 sm:gap-3 lg:gap-2 flex-wrap relative">
        {!showOriginal && (
          <>
            <Popover.Root open={showTranslationInfo} onOpenChange={setShowTranslationInfo}>
              <Popover.Trigger asChild>
                <InfoButton
                  variant="primary"
                  size="sm"
                  className="order-2 sm:order-1"
                >
                  Show translation info
                </InfoButton>
              </Popover.Trigger>
              
              <Popover.Portal>
                <Popover.Content 
                  className="z-50 w-72 max-w-[calc(100vw-32px)] rounded-md bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  avoidCollisions={true}
                  collisionPadding={16}
                >
                  <TranslationInfoContent translationData={translationData} />
                  <Popover.Arrow className="fill-popover w-5 h-5 -mt-px" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            
            <InfoLabel 
              variant="success"
              size="default"
              className="order-1 sm:order-2"
            >
              {translationData.difficulty} Level
            </InfoLabel>
          </>
        )}
        
        <InfoButton
          onClick={onToggleView}
          variant="secondary"
          size="default"
          className={`order-3 ${
            showOriginal
              ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
              : ''
          }`}
        >
          {showOriginal ? 'Show translated story' : 'Show original story'}
        </InfoButton>
      </div>
    </div>
  );
};

export default StoryHeader; 