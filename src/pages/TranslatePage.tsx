import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryContainer from '../components/story/StoryContainer';
import StorySidebar from '../components/sidebar/story/StorySidebar';
import GrammarSidebar from '../components/sidebar/grammar/GrammarSidebar';
import { TranslationResponse } from '../lib/translationService';

const TranslatePage: React.FC = () => {
  const navigate = useNavigate();
  const [storyOpen, setStoryOpen] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);

  const handleStoryTranslated = (data: TranslationResponse) => {
    // Navigate to the story page with the translation data
    // For now, we'll pass the data through state, but in the future
    // we'll save it and pass an ID
    void navigate('/story', { state: { translationData: data } });
  };

  return (
    <div className='relative'>
      <StoryContainer onStoryTranslated={handleStoryTranslated} />
      <StorySidebar
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

export default TranslatePage;
