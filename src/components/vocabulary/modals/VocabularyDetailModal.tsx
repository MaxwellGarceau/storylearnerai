import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Edit, Trash2, BookOpen, ExternalLink } from 'lucide-react';

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
import { logger } from '../../../lib/logger';
import { useAuth } from '../../../hooks/useAuth';
import { SavedTranslationService } from '../../../api/supabase/database/savedTranslationService';
interface VocabularyDetailModalProps {
  vocabulary: VocabularyWithLanguages;
  _onClose: () => void;
}

export function VocabularyDetailModal({
  vocabulary,
  _onClose,
}: VocabularyDetailModalProps) {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleNavigateToSavedTranslation = async () => {
    if (vocabulary.saved_translation_id && user) {
      try {
        const service = new SavedTranslationService();
        const savedTranslation = await service.getSavedTranslation(
          String(vocabulary.saved_translation_id),
          user.id
        );

        if (savedTranslation) {
          // Prefer URL param navigation for deep linking and refresh safety
          void navigate(`/story?id=${savedTranslation.id}`, {
            state: {
              // Keep fast-path state for instant render when available
              translationData: {
                fromText: savedTranslation.from_text,
                toText: savedTranslation.to_text,
                difficulty: savedTranslation.difficulty_level.code,
                fromLanguage: savedTranslation.from_language.code,
                toLanguage: savedTranslation.to_language.code,
                provider: 'saved',
                model: 'saved-translation',
              },
              isSavedStory: true,
              savedTranslationId: savedTranslation.id,
            },
          });
        }
      } catch (error) {
        logger.error('ui', 'Error navigating to saved translation', { error });
      }
    }
  };
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
                fromWord={vocabulary.from_word}
                targetWord={vocabulary.target_word}
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
              toLanguage={vocabulary.target_language.name}
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
            partOfSpeechKey={pos => t(`vocabulary.partsOfSpeech.${pos}`)}
            frequencyKey={freq => t(`vocabulary.frequencyLevels.${freq}`)}
          />

          {/* Context */}
          <ContextSection
            fromContext={vocabulary.from_word_context}
            targetContext={vocabulary.target_word_context}
          />

          {/* Saved Translation Navigation */}
          {vocabulary.saved_translation_id && (
            <div className='space-y-3'>
              <h4 className='font-medium'>
                {t('vocabulary.detail.savedTranslation')}
              </h4>
              <div className='p-4 bg-muted/50 rounded-lg border'>
                <div>
                  <div className='text-sm text-muted-foreground mb-2'>
                    {t('vocabulary.detail.savedTranslationDescription')}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      void handleNavigateToSavedTranslation();
                    }}
                    className='flex items-center gap-2'
                  >
                    <ExternalLink className='h-4 w-4' />
                    {t('vocabulary.detail.viewSavedTranslation')}
                  </Button>
                </div>
              </div>
            </div>
          )}
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
