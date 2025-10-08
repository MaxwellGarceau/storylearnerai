import { useState } from 'react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react';
import type { DatabaseSavedTranslationWithDetails } from '../../types/database';
import type { VoidFunction } from '../../types/common';

interface DeleteTranslationModalProps {
  isOpen: boolean;
  onClose: VoidFunction;
  onConfirm: () => Promise<boolean>;
  translation: DatabaseSavedTranslationWithDetails | null;
}

export function DeleteTranslationModal({
  isOpen,
  onClose,
  onConfirm,
  translation,
}: DeleteTranslationModalProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !translation) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const success = await onConfirm();
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !m-0'>
      <div className='bg-background rounded-lg shadow-lg sm:max-w-[500px] m-4 max-h-[90vh] overflow-y-auto p-6 relative'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center'>
            <Trash2 className='w-5 h-5 text-destructive' />
          </div>
          <div>
            <h2 className='text-lg font-semibold'>
              {t('savedTranslations.deleteModal.title')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('savedTranslations.deleteModal.subtitle')}
            </p>
          </div>
        </div>

        <div className='mb-6'>
          <p className='text-muted-foreground mb-4'>
            {t('savedTranslations.deleteModal.description')}
          </p>
          
          <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
            <div>
              <h4 className='font-medium text-sm mb-1'>
                {translation.title || t('savedTranslations.results.untitled')}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {translation.from_language.name} → {translation.to_language.name} • {translation.difficulty_level.name}
              </p>
            </div>
            
            <div className='text-sm'>
              <p className='text-muted-foreground mb-1'>
                {t('savedTranslations.deleteModal.preview')}:
              </p>
              <div className='bg-background rounded border p-2 max-h-20 overflow-y-auto'>
                <p className='text-xs leading-relaxed'>
                  {translation.from_text.length > 100 
                    ? `${translation.from_text.substring(0, 100)}...`
                    : translation.from_text
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex gap-3 justify-end'>
          <Button 
            variant='outline' 
            onClick={onClose} 
            disabled={isDeleting}
            className='flex items-center gap-2'
          >
            <X className='w-4 h-4' />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            variant='destructive'
            className='flex items-center gap-2'
          >
            <Trash2 className='w-4 h-4' />
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
