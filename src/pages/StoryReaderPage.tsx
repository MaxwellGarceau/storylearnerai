import React from 'react';
import Layout from '../components/Layout';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { TranslationResponse } from '../lib/translationService';

interface StoryReaderPageProps {
  translationData: TranslationResponse;
  onTranslateAnother: () => void;
}

const StoryReaderPage: React.FC<StoryReaderPageProps> = ({ translationData, onTranslateAnother }) => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Translated Story</h2>
          <p className="text-gray-600">Enjoy reading your story in English!</p>
        </div>
        
        <StoryRender translationData={translationData} />
        
        <div className="mt-8 text-center">
          <Button 
            onClick={onTranslateAnother}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Translate Another Story
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default StoryReaderPage; 