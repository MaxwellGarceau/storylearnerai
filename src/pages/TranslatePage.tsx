import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoryContainer from '../components/story/StoryContainer';
import SidebarContainer from '../components/sidebar/SidebarContainer';
import { TranslationResponse } from '../lib/translationService';

const TranslatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStoryTranslated = (data: TranslationResponse) => {
    // Navigate to the story page with the translation data
    // For now, we'll pass the data through state, but in the future
    // we'll save it and pass an ID
    void navigate('/story', { state: { translationData: data } });
  };

  return (
    <div className='relative'>
      <StoryContainer onStoryTranslated={handleStoryTranslated} />
      <SidebarContainer />
    </div>
  );
};

export default TranslatePage;
