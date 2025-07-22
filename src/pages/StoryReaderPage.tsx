import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StoryRender from '../components/story/StoryRender';
import { Button } from '../components/ui/Button';
import { TranslationResponse } from '../lib/translationService';

const StoryReaderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const translationData = location.state?.translationData as TranslationResponse | undefined;

  const handleTranslateAnother = () => {
    navigate('/translate');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // If no translation data is available, show a message
  if (!translationData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">No Story Found</h2>
            <p className="text-gray-600">Please translate a story first to view it here.</p>
          </div>
          
          <div className="space-x-4">
            <Button 
              onClick={handleTranslateAnother}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Translate a Story
            </Button>
            <Button 
              onClick={handleGoHome}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Translated Story</h2>
          <p className="text-gray-600">Enjoy reading your story in English!</p>
        </div>
        
        <StoryRender translationData={translationData} />
        
        <div className="mt-8 text-center space-x-4">
          <Button 
            onClick={handleTranslateAnother}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Translate Another Story
          </Button>
          <Button 
            onClick={handleGoHome}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Go Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default StoryReaderPage; 