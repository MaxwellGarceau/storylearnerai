import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoryContainer from '../components/story/StoryContainer';
import { LexicalCollectionsProvider } from '../components/providers/LexicalCollectionsProvider';
import StorySidebar from '../components/sidebar/StorySidebar';
import { TranslationResponse } from '../lib/translationService';

function TranslatePageContent(): JSX.Element {
  const navigate = useNavigate();

  const handleStoryTranslated = (
    data: TranslationResponse,
    lexicalData?: { translations: import('../types/dictionary').TranslationWord[]; dictionary: import('../types/dictionary').DictionaryWord[] }
  ) => {
    void navigate('/story', { state: { translationData: data, lexicalData } });
  };

  return (
    <div className='relative'>
      <StoryContainer onStoryTranslated={handleStoryTranslated} />
      <StorySidebar />
    </div>
  );
}

const TranslatePage: React.FC = () => {
  return (
    <LexicalCollectionsProvider>
      <TranslatePageContent />
    </LexicalCollectionsProvider>
  );
};

export default TranslatePage;
