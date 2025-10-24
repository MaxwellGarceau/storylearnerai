import React, { useState } from 'react';
import StorySidebar from './story/StorySidebar';
import GrammarSidebar from './grammar/GrammarSidebar';
import type { TranslationResponse } from '../../lib/translationService';

interface SidebarContainerProps {
  translationData?: TranslationResponse;
  className?: string;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  translationData,
  className,
}) => {
  const [storyOpen, setStoryOpen] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);

  return (
    <div className={className}>
      <StorySidebar
        translationData={translationData}
        isOpen={storyOpen}
        onOpen={() => {
          setGrammarOpen(false);
          setStoryOpen(true);
        }}
        hideToggle={grammarOpen}
        onRequestClose={() => setStoryOpen(false)}
      />
      <GrammarSidebar
        isOpen={grammarOpen}
        onOpen={() => {
          setStoryOpen(false);
          setGrammarOpen(true);
        }}
        hideToggle={storyOpen}
        onRequestClose={() => setGrammarOpen(false)}
      />
    </div>
  );
};

export default SidebarContainer;
