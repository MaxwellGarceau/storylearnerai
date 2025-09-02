import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Edit, Trash2, Calendar, BookOpen, Languages, X } from 'lucide-react';

import type { VocabularyWithLanguages } from '../../types/database/vocabulary';
import { useLocalization } from '../../hooks/useLocalization';
import { VocabularyEditModal } from './VocabularyEditModal';
import { VocabularyDeleteDialog } from './VocabularyDeleteDialog';

interface VocabularyDetailModalProps {
  vocabulary: VocabularyWithLanguages;
  _onClose: () => void;
}

export function VocabularyDetailModal({
  vocabulary,
  _onClose,
}: VocabularyDetailModalProps) {
  const { t } = useLocalization();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-background rounded-lg shadow-lg sm:max-w-[500px] m-4 max-h-[90vh] overflow-y-auto p-4'>
          <div className='p-6 border-b'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                {t('vocabulary.detail.title')}
              </h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={_onClose}
                className='h-8 w-8 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='space-y-4'>
            {/* Word Information */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-lg'>
                    {vocabulary.original_word}
                  </span>
                  <span className='text-muted-foreground'>→</span>
                  <span className='font-semibold text-lg'>
                    {vocabulary.translated_word}
                  </span>
                </div>
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setShowDeleteDialog(true)}
                    className='text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Language and Metadata */}
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Languages className='h-4 w-4' />
                <span>
                  {vocabulary.from_language.name} →{' '}
                  {vocabulary.translated_language.name}
                </span>
                <span>•</span>
                <Calendar className='h-4 w-4' />
                <span>{formatDate(vocabulary.created_at)}</span>
              </div>
            </div>

            <hr className='border-t border-border' />

            {/* Definition */}
            {vocabulary.definition && (
              <div className='space-y-2'>
                <h4 className='font-medium'>
                  {t('vocabulary.detail.definition')}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {vocabulary.definition}
                </p>
              </div>
            )}

            {/* Part of Speech and Frequency */}
            {(vocabulary.part_of_speech ?? vocabulary.frequency_level) && (
              <div className='flex gap-2'>
                {vocabulary.part_of_speech && (
                  <Badge variant='outline'>
                    {t(`vocabulary.pos.${vocabulary.part_of_speech}`)}
                  </Badge>
                )}
                {vocabulary.frequency_level && (
                  <Badge variant='secondary'>
                    {t(`vocabulary.frequency.${vocabulary.frequency_level}`)}
                  </Badge>
                )}
              </div>
            )}

            {/* Context */}
            {(vocabulary.original_word_context ??
              vocabulary.translated_word_context) && (
              <div className='space-y-3'>
                <hr className='border-t border-border' />
                <h4 className='font-medium'>
                  {t('vocabulary.detail.context')}
                </h4>

                {vocabulary.original_word_context && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {vocabulary.from_language.name}:
                    </p>
                    <p className='text-sm bg-muted p-2 rounded'>
                      {vocabulary.original_word_context}
                    </p>
                  </div>
                )}

                {vocabulary.translated_word_context && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {vocabulary.translated_language.name}:
                    </p>
                    <p className='text-sm bg-muted p-2 rounded'>
                      {vocabulary.translated_word_context}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <VocabularyEditModal
          vocabulary={vocabulary}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <VocabularyDeleteDialog
          vocabulary={vocabulary}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
}
