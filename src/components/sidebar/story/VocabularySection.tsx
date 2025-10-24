import React from 'react';
import { VocabularySidebar } from '../../vocabulary/sidebar/VocabularySidebar';

interface VocabularySectionProps {
  currentLanguageId: number | undefined;
  currentFromLanguageId: number | undefined;
}

const VocabularySection: React.FC<VocabularySectionProps> = ({
  currentLanguageId,
  currentFromLanguageId,
}) => {
  return (
    <div className='p-4'>
      <VocabularySidebar
        currentLanguageId={currentLanguageId}
        currentFromLanguageId={currentFromLanguageId}
      />
    </div>
  );
};

export default VocabularySection;
