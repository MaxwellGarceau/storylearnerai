import { useState } from 'react';
import { Button } from '../../ui/Button';
import { useVocabulary } from '../../../hooks/useVocabulary';
import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';
import { useLocalization } from '../../../hooks/useLocalization';
import type { VoidFunction } from '../../../types/common';
import { VocabularyModalContainer } from './VocabularyModalContainer';

interface VocabularyDeleteDialogProps {
  vocabulary: VocabularyWithLanguages;
  onClose: VoidFunction;
  onDeleteSuccess?: VoidFunction;
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
    <VocabularyModalContainer>
      <div className='p-2'>
        <h2 className='text-lg font-semibold mb-2'>
          {t('vocabulary.delete.title')}
        </h2>
        <p className='text-muted-foreground mb-6'>
          {t('vocabulary.delete.description', {
            fromWord: vocabulary.from_word,
            targetWord: vocabulary.target_word,
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
    </VocabularyModalContainer>
  );
}
