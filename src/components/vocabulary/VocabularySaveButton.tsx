import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { BookOpen, Check } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLocalization } from '../../hooks/useLocalization';
import { VocabularySaveModal } from './VocabularySaveModal';

interface VocabularySaveButtonProps {
  originalWord: string;
  translatedWord: string;
  originalContext?: string;
  translatedContext?: string;
  fromLanguageId: number;
  translatedLanguageId: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function VocabularySaveButton({
  originalWord,
  translatedWord,
  originalContext,
  translatedContext,
  fromLanguageId,
  translatedLanguageId,
  className,
  variant = 'outline',
  size = 'sm',
}: VocabularySaveButtonProps) {
  const { t } = useLocalization();
  const { checkVocabularyExists } = useVocabulary();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check if word is already saved
  React.useEffect(() => {
    const checkIfSaved = async () => {
      setIsChecking(true);
      try {
        const exists = await checkVocabularyExists(
          originalWord,
          translatedWord,
          fromLanguageId,
          translatedLanguageId
        );
        setIsSaved(exists);
      } catch (error) {
        console.error('Error checking vocabulary existence:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (originalWord && translatedWord) {
      checkIfSaved();
    }
  }, [
    originalWord,
    translatedWord,
    fromLanguageId,
    translatedLanguageId,
    checkVocabularyExists,
  ]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveSuccess = () => {
    setIsSaved(true);
    setShowSaveModal(false);
  };

  if (isChecking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className='animate-spin rounded-full h-3 w-3 border-b border-current mr-1'></div>
        {t('vocabulary.checking')}
      </Button>
    );
  }

  if (isSaved) {
    return (
      <Button
        variant='ghost'
        size={size}
        disabled
        className={`text-green-600 ${className}`}
      >
        <Check className='h-3 w-3 mr-1' />
        {t('vocabulary.saved')}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleSaveClick}
        className={className}
        title={t('vocabulary.save.tooltip')}
      >
        <BookOpen className='h-3 w-3 mr-1' />
        {t('vocabulary.save')}
      </Button>

      {showSaveModal && (
        <VocabularySaveModal
          onClose={() => setShowSaveModal(false)}
          currentLanguageId={translatedLanguageId}
          currentFromLanguageId={fromLanguageId}
          initialData={{
            originalWord,
            translatedWord,
            originalContext,
            translatedContext,
          }}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
}
