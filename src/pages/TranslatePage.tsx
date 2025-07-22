import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageContainer from '../components/PageContainer';
import StoryContainer from '../components/story/StoryContainer';
import { TranslationResponse } from '../lib/translationService';

const TranslatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStoryTranslated = (data: TranslationResponse) => {
    // Navigate to the story page with the translation data
    // For now, we'll pass the data through state, but in the future
    // we'll save it and pass an ID
    navigate('/story', { state: { translationData: data } });
  };

  return (
    <Layout>
      <PageContainer>
        <StoryContainer onStoryTranslated={handleStoryTranslated} />
      </PageContainer>
    </Layout>
  );
};

export default TranslatePage; 