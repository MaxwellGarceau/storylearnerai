import React, { useState } from 'react';
import { Button } from '../ui/Button';
import Label from '../ui/Label';
import { X } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';

import type {
  VocabularyWithLanguages,
  VocabularyUpdate,
} from '../../types/database/vocabulary';
import { useLocalization } from '../../hooks/useLocalization';

interface VocabularyEditModalProps {
  vocabulary: VocabularyWithLanguages;
  onClose: () => void;
}

export function VocabularyEditModal({
  vocabulary,
  onClose,
}: VocabularyEditModalProps) {
  const { t } = useLocalization();
  const { updateVocabularyWord } = useVocabulary();

  const [formData, setFormData] = useState({
    original_word: vocabulary.original_word,
    translated_word: vocabulary.translated_word,
    original_word_context: vocabulary.original_word_context ?? '',
    translated_word_context: vocabulary.translated_word_context ?? '',
    definition: vocabulary.definition ?? '',
    part_of_speech: vocabulary.part_of_speech ?? '',
    frequency_level: vocabulary.frequency_level ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.original_word.trim()) {
      newErrors.original_word = t('vocabulary.validation.originalWordRequired');
    }

    if (!formData.translated_word.trim()) {
      newErrors.translated_word = t(
        'vocabulary.validation.translatedWordRequired'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updates: VocabularyUpdate = {
        original_word: formData.original_word.trim(),
        translated_word: formData.translated_word.trim(),
        original_word_context: formData.original_word_context.trim() || null,
        translated_word_context:
          formData.translated_word_context.trim() || null,
        definition: formData.definition.trim() || null,
        part_of_speech: formData.part_of_speech || null,
        frequency_level: formData.frequency_level || null,
      };

      const result = await updateVocabularyWord(vocabulary.id, updates);

      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating vocabulary word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg shadow-lg sm:max-w-[500px] max-h-[90vh] overflow-y-auto m-4 p-4 relative'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='absolute top-[6px] right-[6px] h-8 w-8 p-0'
        >
          <X className='h-4 w-4' />
        </Button>
        <div className='p-6 border-b'>
          <h2 className='text-lg font-semibold'>
            {t('vocabulary.edit.title')}
          </h2>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className='grid grid-cols-2 gap-4 pt-4 mb-4'>
            <div className='space-y-2'>
              <Label htmlFor='original_word'>
                {t('vocabulary.form.originalWord')}
              </Label>
              <input
                type='text'
                id='original_word'
                value={formData.original_word}
                onChange={e =>
                  handleInputChange('original_word', e.target.value)
                }
                placeholder={t('vocabulary.form.originalWordPlaceholder')}
                className={`w-full p-2 border rounded-md ${errors.original_word ? 'border-destructive' : ''}`}
              />
              {errors.original_word && (
                <p className='text-sm text-destructive'>
                  {errors.original_word}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='translated_word'>
                {t('vocabulary.form.translatedWord')}
              </Label>
              <input
                type='text'
                id='translated_word'
                value={formData.translated_word}
                onChange={e =>
                  handleInputChange('translated_word', e.target.value)
                }
                placeholder={t('vocabulary.form.translatedWordPlaceholder')}
                className={`w-full p-2 border rounded-md ${errors.translated_word ? 'border-destructive' : ''}`}
              />
              {errors.translated_word && (
                <p className='text-sm text-destructive'>
                  {errors.translated_word}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2 mb-4'>
            <Label htmlFor='original_word_context'>
              {t('vocabulary.form.originalContext')}
            </Label>
            <textarea
              id='original_word_context'
              value={formData.original_word_context}
              onChange={e =>
                handleInputChange('original_word_context', e.target.value)
              }
              placeholder={t('vocabulary.form.originalContextPlaceholder')}
              rows={2}
              className='w-full p-2 border rounded-md resize-none'
            />
          </div>

          <div className='space-y-2 mb-4'>
            <Label htmlFor='translated_word_context'>
              {t('vocabulary.form.translatedContext')}
            </Label>
            <textarea
              id='translated_word_context'
              value={formData.translated_word_context}
              onChange={e =>
                handleInputChange('translated_word_context', e.target.value)
              }
              placeholder={t('vocabulary.form.translatedContextPlaceholder')}
              rows={2}
              className='w-full p-2 border rounded-md resize-none'
            />
          </div>

          <div className='space-y-2 mb-4'>
            <Label htmlFor='definition'>
              {t('vocabulary.form.definition')}
            </Label>
            <textarea
              id='definition'
              value={formData.definition}
              onChange={e => handleInputChange('definition', e.target.value)}
              placeholder={t('vocabulary.form.definitionPlaceholder')}
              rows={3}
              className='w-full p-2 border rounded-md resize-none'
            />
          </div>

          {/* Part of Speech and Frequency */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div className='space-y-2'>
              <Label htmlFor='part_of_speech'>
                {t('vocabulary.form.partOfSpeech')}
              </Label>
              <select
                id='part_of_speech'
                value={formData.part_of_speech}
                onChange={e =>
                  handleInputChange('part_of_speech', e.target.value)
                }
                className='w-full p-2 text-sm border rounded-md'
              >
                <option value=''>
                  {t('vocabulary.form.selectPartOfSpeech')}
                </option>
                <option value='noun'>
                  {t('vocabulary.partsOfSpeech.noun')}
                </option>
                <option value='verb'>
                  {t('vocabulary.partsOfSpeech.verb')}
                </option>
                <option value='adjective'>
                  {t('vocabulary.partsOfSpeech.adjective')}
                </option>
                <option value='adverb'>
                  {t('vocabulary.partsOfSpeech.adverb')}
                </option>
                <option value='pronoun'>
                  {t('vocabulary.partsOfSpeech.pronoun')}
                </option>
                <option value='preposition'>
                  {t('vocabulary.partsOfSpeech.preposition')}
                </option>
                <option value='conjunction'>
                  {t('vocabulary.partsOfSpeech.conjunction')}
                </option>
                <option value='interjection'>
                  {t('vocabulary.partsOfSpeech.interjection')}
                </option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='frequency_level'>
                {t('vocabulary.form.frequencyLevel')}
              </Label>
              <select
                id='frequency_level'
                value={formData.frequency_level}
                onChange={e =>
                  handleInputChange('frequency_level', e.target.value)
                }
                className='w-full p-2 text-sm border rounded-md'
              >
                <option value=''>{t('vocabulary.form.selectFrequency')}</option>
                <option value='common'>
                  {t('vocabulary.frequencyLevels.common')}
                </option>
                <option value='uncommon'>
                  {t('vocabulary.frequencyLevels.uncommon')}
                </option>
                <option value='rare'>
                  {t('vocabulary.frequencyLevels.rare')}
                </option>
                <option value='veryRare'>
                  {t('vocabulary.frequencyLevels.veryRare')}
                </option>
              </select>
            </div>
          </div>

          <div className='text-sm text-muted-foreground'>
            <p>
              <strong>{t('vocabulary.form.languages')}:</strong>{' '}
              {vocabulary.from_language.name} →{' '}
              {vocabulary.translated_language.name}
            </p>
          </div>

          <div className='flex justify-end space-x-2 pt-4 p-6'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
