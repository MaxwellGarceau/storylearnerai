import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Translate Your Story</h2>
        <p className="text-gray-600 mb-6">Enter a story in any language and we'll translate it to English</p>
        <StoryContainer onStoryTranslated={handleStoryTranslated} />
      </div>
    </Layout>
  );
};

export default TranslatePage; 