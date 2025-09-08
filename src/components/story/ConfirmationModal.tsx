import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip';
import type { LanguageCode, DifficultyLevel } from '../../types/llm/prompts';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromLanguage: LanguageCode;
  toLanguage: LanguageCode;
  difficulty: DifficultyLevel;
  selectedVocabulary: string[];
  getLanguageName: (code: LanguageCode) => string;
  getDifficultyLabel: (difficulty: DifficultyLevel) => string;
  onGoToOptionsSection: (section: 'language' | 'difficulty' | 'vocabulary') => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromLanguage,
  toLanguage,
  difficulty,
  selectedVocabulary,
  getLanguageName,
  getDifficultyLabel,
  onGoToOptionsSection,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg p-6 max-w-md w-full mx-4'>
        <h3 className='text-lg font-semibold mb-4'>
          {t('storyInput.confirmationModal.title')}
        </h3>

        <div className='space-y-3 mb-6'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>
              {t('storyInput.confirmationModal.from')}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => onGoToOptionsSection('language')}
                  className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                  aria-label={t('storyInput.confirmationModal.editLanguage')}
                >
                  {getLanguageName(fromLanguage)}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t('storyInput.confirmationModal.clickToChangeLanguage')}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>
              {t('storyInput.confirmationModal.to')}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => onGoToOptionsSection('language')}
                  className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                  aria-label={t('storyInput.confirmationModal.editLanguage')}
                >
                  {getLanguageName(toLanguage)}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t('storyInput.confirmationModal.clickToChangeLanguage')}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>
              {t('storyInput.confirmationModal.difficulty')}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => onGoToOptionsSection('difficulty')}
                  className='font-medium text-primary underline underline-offset-2 hover:opacity-90'
                  aria-label={t('storyInput.confirmationModal.editDifficulty')}
                >
                  {getDifficultyLabel(difficulty)}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t('storyInput.confirmationModal.clickToChangeDifficulty')}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className='flex justify-between items-start'>
            <span className='text-muted-foreground'>
              {t('storyInput.confirmationModal.vocabulary')}
            </span>
            <div className='text-right'>
              {selectedVocabulary?.length ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={() => onGoToOptionsSection('vocabulary')}
                        className='text-xs text-muted-foreground underline underline-offset-2 hover:opacity-90 text-right block'
                        aria-label={t('storyInput.confirmationModal.editVocabulary')}
                      >
                        {t('storyInput.confirmationModal.vocabularySelectedCount', {
                          count: selectedVocabulary.length
                        })}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t('storyInput.confirmationModal.clickToChangeVocabulary')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={() => onGoToOptionsSection('vocabulary')}
                        className='mt-1 text-sm underline underline-offset-2 hover:opacity-90 text-right block'
                        aria-label={t('storyInput.confirmationModal.editVocabulary')}
                      >
                        {selectedVocabulary.join(', ')}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t('storyInput.confirmationModal.clickToChangeVocabulary')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <div className='text-sm'>
                  <span>
                    {t('storyInput.confirmationModal.noVocabularySelected')}
                  </span>
                  {user && (
                    <>
                      <span className='mx-1'>·</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            onClick={() => onGoToOptionsSection('vocabulary')}
                            className='text-primary underline underline-offset-2 hover:opacity-90'
                            aria-label={t('storyInput.confirmationModal.goToVocabulary')}
                          >
                            {t('storyInput.confirmationModal.goToVocabulary')}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {t('storyInput.confirmationModal.clickToChangeVocabulary')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button
            onClick={onClose}
            variant='outline'
            className='flex-1'
          >
            <X className='w-4 h-4 mr-2' />
            {t('storyInput.confirmationModal.cancel')}
          </Button>
          <Button onClick={onConfirm} className='flex-1'>
            <Check className='w-4 h-4 mr-2' />
            {t('storyInput.confirmationModal.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
