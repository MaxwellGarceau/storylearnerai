import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Edit, Trash2, BookOpen } from 'lucide-react';

import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';
import { useLocalization } from '../../../hooks/useLocalization';
import { VocabularyEditModal } from './VocabularyEditModal';
import { VocabularyDeleteDialog } from './VocabularyDeleteDialog';
import { VocabularyModalContainer } from './VocabularyModalContainer';
import { DateUtils } from '../../../lib/utils/dateUtils';
import { ModalHeader } from '../../ui/ModalHeader';
import { WordDisplay } from '../../ui/WordDisplay';
import { LanguageMetadata } from '../../ui/LanguageMetadata';
import { BadgeSection } from '../../ui/BadgeSection';
import { ContextSection } from '../../ui/ContextSection';
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
  return (
    <>
      <VocabularyModalContainer>
        <ModalHeader
          title={t('vocabulary.detail.title')}
          onClose={_onClose}
          icon={BookOpen}
        />

        <div className='space-y-4'>
          {/* Word Information */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between py-3'>
              <WordDisplay
                originalWord={vocabulary.original_word}
                translatedWord={vocabulary.translated_word}
              />
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
            <LanguageMetadata
              fromLanguage={vocabulary.from_language.name}
              toLanguage={vocabulary.translated_language.name}
              createdAt={DateUtils.formatDate(vocabulary.created_at)}
            />
          </div>

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
          <BadgeSection
            partOfSpeech={vocabulary.part_of_speech}
            frequencyLevel={vocabulary.frequency_level}
            partOfSpeechKey={pos => t(`vocabulary.pos.${pos}`)}
            frequencyKey={freq => t(`vocabulary.frequency.${freq}`)}
          />

          {/* Context */}
          <ContextSection
            originalContext={vocabulary.original_word_context}
            translatedContext={vocabulary.translated_word_context}
          />
        </div>
      </VocabularyModalContainer>

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
          onDeleteSuccess={_onClose}
        />
      )}
    </>
  );
}
