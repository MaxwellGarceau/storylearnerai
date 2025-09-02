import React, { useState } from 'react';
import { Button } from '../ui/Button';
import Label from '../ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLanguages } from '../../hooks/useLanguages';
import type { VocabularyInsert } from '../../types/database/vocabulary';
import { useLocalization } from '../../hooks/useLocalization';

interface VocabularySaveModalProps {
  onClose: () => void;
  currentLanguageId?: number;
  currentFromLanguageId?: number;
  initialData?: {
    originalWord?: string;
    translatedWord?: string;
    originalContext?: string;
    translatedContext?: string;
  };
  onSaveSuccess?: () => void;
}

export function VocabularySaveModal({
  onClose,
  currentLanguageId,
  currentFromLanguageId,
  initialData,
  onSaveSuccess,
}: VocabularySaveModalProps) {
  const { t } = useLocalization();
  const { saveVocabularyWord, checkVocabularyExists } = useVocabulary();
  const { languages } = useLanguages();

  const [formData, setFormData] = useState({
    original_word: initialData?.originalWord ?? '',
    translated_word: initialData?.translatedWord ?? '',
    from_language_id: currentFromLanguageId ?? 1, // Default to English
    translated_language_id: currentLanguageId ?? 2, // Default to Spanish
    original_word_context: initialData?.originalContext ?? '',
    translated_word_context: initialData?.translatedContext ?? '',
    definition: '',
    part_of_speech: '',
    frequency_level: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partOfSpeechOptions = [
    { value: 'noun', label: t('vocabulary.partsOfSpeech.noun') },
    { value: 'verb', label: t('vocabulary.partsOfSpeech.verb') },
    { value: 'adjective', label: t('vocabulary.partsOfSpeech.adjective') },
    { value: 'adverb', label: t('vocabulary.partsOfSpeech.adverb') },
    { value: 'pronoun', label: t('vocabulary.partsOfSpeech.pronoun') },
    { value: 'preposition', label: t('vocabulary.partsOfSpeech.preposition') },
    { value: 'conjunction', label: t('vocabulary.partsOfSpeech.conjunction') },
    {
      value: 'interjection',
      label: t('vocabulary.partsOfSpeech.interjection'),
    },
    { value: 'article', label: t('vocabulary.partsOfSpeech.article') },
    { value: 'numeral', label: t('vocabulary.partsOfSpeech.numeral') },
  ];

  const frequencyLevelOptions = [
    { value: 'common', label: t('vocabulary.frequencyLevels.common') },
    { value: 'uncommon', label: t('vocabulary.frequencyLevels.uncommon') },
    { value: 'rare', label: t('vocabulary.frequencyLevels.rare') },
    { value: 'veryRare', label: t('vocabulary.frequencyLevels.veryRare') },
  ];

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.original_word.trim()) {
      newErrors.original_word = t('vocabulary.validation.originalWordRequired');
    }

    if (!formData.translated_word.trim()) {
      newErrors.translated_word = t(
        'vocabulary.validation.translatedWordRequired'
      );
    }

    if (!formData.from_language_id) {
      newErrors.from_language_id = t(
        'vocabulary.validation.fromLanguageRequired'
      );
    }

    if (!formData.translated_language_id) {
      newErrors.translated_language_id = t(
        'vocabulary.validation.translatedLanguageRequired'
      );
    }

    // Check if vocabulary already exists
    if (formData.original_word.trim() && formData.translated_word.trim()) {
      const exists = await checkVocabularyExists(
        formData.original_word.trim(),
        formData.translated_word.trim(),
        formData.from_language_id,
        formData.translated_language_id
      );

      if (exists) {
        newErrors.general = t('vocabulary.validation.alreadyExists');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    setIsSubmitting(true);

    try {
      const vocabularyData: VocabularyInsert = {
        original_word: formData.original_word.trim(),
        translated_word: formData.translated_word.trim(),
        from_language_id: formData.from_language_id,
        translated_language_id: formData.translated_language_id,
        original_word_context: formData.original_word_context.trim() || null,
        translated_word_context:
          formData.translated_word_context.trim() || null,
        definition: formData.definition.trim() || null,
        part_of_speech: formData.part_of_speech || null,
        frequency_level: formData.frequency_level || null,
      };

      const result = await saveVocabularyWord(vocabularyData);

      if (result) {
        onSaveSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error saving vocabulary word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg shadow-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto m-4 p-4'>
        <div className='p-6 border-b'>
          <h2 className='text-lg font-semibold'>
            {t('vocabulary.save.title')}
          </h2>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            void handleSubmit(e);
          }}
          className='space-y-4'
        >
          {/* Word Fields */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='original_word'>
                {t('vocabulary.form.originalWord')} *
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
                {t('vocabulary.form.translatedWord')} *
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

          {/* Language Fields */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='from_language'>
                {t('vocabulary.form.fromLanguage')} *
              </Label>
              <Select
                value={formData.from_language_id.toString()}
                onValueChange={value =>
                  handleInputChange('from_language_id', Number(value))
                }
              >
                <SelectTrigger
                  className={
                    errors.from_language_id ? 'border-destructive' : ''
                  }
                >
                  <SelectValue
                    placeholder={t('vocabulary.form.selectLanguage')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(language => (
                    <SelectItem
                      key={language.id}
                      value={language.id.toString()}
                    >
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.from_language_id && (
                <p className='text-sm text-destructive'>
                  {errors.from_language_id}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='translated_language'>
                {t('vocabulary.form.translatedLanguage')} *
              </Label>
              <Select
                value={formData.translated_language_id.toString()}
                onValueChange={value =>
                  handleInputChange('translated_language_id', Number(value))
                }
              >
                <SelectTrigger
                  className={
                    errors.translated_language_id ? 'border-destructive' : ''
                  }
                >
                  <SelectValue
                    placeholder={t('vocabulary.form.selectLanguage')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(language => (
                    <SelectItem
                      key={language.id}
                      value={language.id.toString()}
                    >
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.translated_language_id && (
                <p className='text-sm text-destructive'>
                  {errors.translated_language_id}
                </p>
              )}
            </div>
          </div>

          {/* Definition */}
          <div className='space-y-2'>
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
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='part_of_speech'>
                {t('vocabulary.form.partOfSpeech')}
              </Label>
              <Select
                value={formData.part_of_speech}
                onValueChange={value =>
                  handleInputChange('part_of_speech', value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('vocabulary.form.selectPartOfSpeech')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {partOfSpeechOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='frequency_level'>
                {t('vocabulary.form.frequencyLevel')}
              </Label>
              <Select
                value={formData.frequency_level}
                onValueChange={value =>
                  handleInputChange('frequency_level', value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('vocabulary.form.selectFrequency')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {frequencyLevelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Context Fields */}
          <div className='space-y-2'>
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

          <div className='space-y-2'>
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

          {errors.general && (
            <p className='text-sm text-destructive'>{errors.general}</p>
          )}

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
