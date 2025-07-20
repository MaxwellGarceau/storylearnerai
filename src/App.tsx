import React, { useState } from 'react';
import Home from './pages/Home';
import StoryReaderPage from './pages/StoryReaderPage';
import { TranslationResponse } from './lib/translationService';

type AppView = 'home' | 'story-reader';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [translationData, setTranslationData] = useState<TranslationResponse | null>(null);

  const handleStoryTranslated = (data: TranslationResponse) => {
    setTranslationData(data);
    setCurrentView('story-reader');
  };

  const handleTranslateAnother = () => {
    setCurrentView('home');
    setTranslationData(null);
  };

  return (
    <>
      {currentView === 'home' && (
        <Home onStoryTranslated={handleStoryTranslated} />
      )}
      {currentView === 'story-reader' && translationData && (
        <StoryReaderPage 
          translationData={translationData} 
          onTranslateAnother={handleTranslateAnother} 
        />
      )}
    </>
  );
}

export default App;
