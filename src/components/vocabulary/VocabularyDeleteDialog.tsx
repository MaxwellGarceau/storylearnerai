import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useVocabulary } from '../../hooks/useVocabulary';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';
import { useLocalization } from '../../hooks/useLocalization';

interface VocabularyDeleteDialogProps {
  vocabulary: VocabularyWithLanguages;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export function VocabularyDeleteDialog({
  vocabulary,
  onClose,
  onDeleteSuccess,
}: VocabularyDeleteDialogProps) {
  const { t } = useLocalization();
  const { deleteVocabularyWord } = useVocabulary();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const success = await deleteVocabularyWord(vocabulary.id);
      if (success) {
        onClose();
        onDeleteSuccess?.();
      }
    } catch (error) {
      console.error('Error deleting vocabulary word:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg shadow-lg max-w-md max-h-[90vh] overflow-y-auto m-4 p-4'>
        <div className='p-2'>
          <h2 className='text-lg font-semibold mb-2'>
            {t('vocabulary.delete.title')}
          </h2>
          <p className='text-muted-foreground mb-6'>
            {t('vocabulary.delete.description', {
              originalWord: vocabulary.original_word,
              translatedWord: vocabulary.translated_word,
            })}
          </p>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose} disabled={isDeleting}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              variant='destructive'
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
