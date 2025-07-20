// pages/Home.tsx
import React from 'react';
import Layout from '../components/Layout';
import StoryContainer from '../components/story/StoryContainer';
import { TranslationResponse } from '../lib/translationService';

interface HomeProps {
  onStoryTranslated: (data: TranslationResponse) => void;
}

const Home: React.FC<HomeProps> = ({ onStoryTranslated }) => {
  return (
    <Layout>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Story Learner AI</h2>
        <StoryContainer onStoryTranslated={onStoryTranslated} />
      </div>
    </Layout>
  );
};

export default Home;
