import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../ui/Button';
import Label from '../../ui/Label';
import { X } from 'lucide-react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLanguages } from '../../../hooks/useLanguages';
import { useLocalization } from '../../../hooks/useLocalization';
import type {
  VocabularyInsert,
  VocabularyUpdate,
  VocabularyWithLanguages,
} from '../../../types/database/vocabulary';

// Common type aliases
type VoidFunction = () => void;

// Using a union in props instead of a separate Mode type

interface BaseProps {
  onClose: VoidFunction;
  onSaveSuccess?: VoidFunction;
}

interface CreateProps extends BaseProps {
  mode: 'create';
  currentLanguageId?: number;
  currentFromLanguageId?: number;
  initialData?: {
    originalWord?: string;
    translatedWord?: string;
    originalContext?: string;
    translatedContext?: string;
  };
}

interface EditProps extends BaseProps {
  mode: 'edit';
  vocabulary: VocabularyWithLanguages;
}

type VocabularyUpsertModalProps = CreateProps | EditProps;

export function VocabularyUpsertModal(props: VocabularyUpsertModalProps) {
  const { t } = useLocalization();
  const { languages } = useLanguages();
  const {
    saveVocabularyWord,
    updateVocabularyWord,
    vocabulary: userVocabulary,
  } = useVocabulary();

  const isCreateMode = props.mode === 'create';
  const editVocabulary = (props as EditProps).vocabulary;

  const [formData, setFormData] = useState({
    original_word: isCreateMode
      ? (props.initialData?.originalWord ?? '')
      : editVocabulary.original_word,
    translated_word: isCreateMode
      ? (props.initialData?.translatedWord ?? '')
      : editVocabulary.translated_word,
    // Language IDs are only needed in create mode (selection). Defaults mirror existing Save modal.
    from_language_id: isCreateMode ? (props.currentFromLanguageId ?? 1) : 0,
    translated_language_id: isCreateMode ? (props.currentLanguageId ?? 2) : 0,
    original_word_context: isCreateMode
      ? (props.initialData?.originalContext ?? '')
      : (editVocabulary.original_word_context ?? ''),
    translated_word_context: isCreateMode
      ? (props.initialData?.translatedContext ?? '')
      : (editVocabulary.translated_word_context ?? ''),
    definition: isCreateMode ? '' : (editVocabulary.definition ?? ''),
    part_of_speech: isCreateMode ? '' : (editVocabulary.part_of_speech ?? ''),
    frequency_level: isCreateMode ? '' : (editVocabulary.frequency_level ?? ''),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const lastDuplicateCheckIdRef = useRef(0);

  const partOfSpeechOptions = useMemo(
    () => [
      { value: 'noun', label: t('vocabulary.partsOfSpeech.noun') },
      { value: 'verb', label: t('vocabulary.partsOfSpeech.verb') },
      { value: 'adjective', label: t('vocabulary.partsOfSpeech.adjective') },
      { value: 'adverb', label: t('vocabulary.partsOfSpeech.adverb') },
      { value: 'pronoun', label: t('vocabulary.partsOfSpeech.pronoun') },
      {
        value: 'preposition',
        label: t('vocabulary.partsOfSpeech.preposition'),
      },
      {
        value: 'conjunction',
        label: t('vocabulary.partsOfSpeech.conjunction'),
      },
      {
        value: 'interjection',
        label: t('vocabulary.partsOfSpeech.interjection'),
      },
      { value: 'article', label: t('vocabulary.partsOfSpeech.article') },
      { value: 'numeral', label: t('vocabulary.partsOfSpeech.numeral') },
    ],
    [t]
  );

  const frequencyLevelOptions = useMemo(
    () => [
      { value: 'common', label: t('vocabulary.frequencyLevels.common') },
      { value: 'uncommon', label: t('vocabulary.frequencyLevels.uncommon') },
      { value: 'rare', label: t('vocabulary.frequencyLevels.rare') },
      { value: 'veryRare', label: t('vocabulary.frequencyLevels.veryRare') },
    ],
    [t]
  );

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

    if (isCreateMode) {
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

      // Prevent same language pair
      if (
        formData.from_language_id &&
        formData.translated_language_id &&
        formData.from_language_id === formData.translated_language_id
      ) {
        const msg = t('vocabulary.validation.languagesMustDiffer');
        newErrors.from_language_id = msg;
        newErrors.translated_language_id = msg;
      }

      const trimmedOriginalLower = formData.original_word.trim().toLowerCase();
      if (trimmedOriginalLower) {
        const existsLocal = userVocabulary.some(
          v => v.original_word.trim().toLowerCase() === trimmedOriginalLower
        );
        if (existsLocal) {
          newErrors.general = t('vocabulary.validation.alreadyExists');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreateMode) {
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
          props.onSaveSuccess?.();
          props.onClose();
        }
      } else {
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

        const result = await updateVocabularyWord(editVocabulary.id, updates);
        if (result) {
          props.onSaveSuccess?.();
          props.onClose();
        }
      }
    } catch (error) {
      console.error('Error upserting vocabulary word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  // Real-time duplicate validation (create mode only)
  useEffect(() => {
    if (!isCreateMode) {
      return;
    }

    const trimmedOriginal = formData.original_word.trim();
    const fromId = formData.from_language_id;
    const toId = formData.translated_language_id;

    // Require original word and valid languages before checking
    if (!trimmedOriginal || !fromId || !toId || fromId === toId) {
      setIsCheckingDuplicate(false);
      return;
    }

    const currentCheckId = ++lastDuplicateCheckIdRef.current;
    setIsCheckingDuplicate(true);

    const timeoutId = setTimeout(() => {
      try {
        // Only apply result if it's the latest request
        if (lastDuplicateCheckIdRef.current === currentCheckId) {
          const existsLocal = userVocabulary.some(
            v =>
              v.original_word.trim().toLowerCase() ===
              trimmedOriginal.toLowerCase()
          );
          if (existsLocal) {
            setErrors(prev => ({
              ...prev,
              general: t('vocabulary.validation.alreadyExists'),
            }));
          } else if (
            errors.general === t('vocabulary.validation.alreadyExists')
          ) {
            setErrors(prev => ({ ...prev, general: '' }));
          }
        }
      } finally {
        if (lastDuplicateCheckIdRef.current === currentCheckId) {
          setIsCheckingDuplicate(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCreateMode,
    formData.original_word,
    formData.from_language_id,
    formData.translated_language_id,
    t,
    userVocabulary,
  ]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-background rounded-lg shadow-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto m-4 p-4 relative'>
        <Button
          variant='ghost'
          size='sm'
          onClick={props.onClose}
          className='absolute top-[6px] right-[6px] h-8 w-8 p-0'
        >
          <X className='h-4 w-4' />
        </Button>
        <div className='p-6 border-b'>
          <h2 className='text-lg font-semibold'>
            {isCreateMode
              ? t('vocabulary.save.title')
              : t('vocabulary.edit.title')}
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
          <div className='grid grid-cols-2 gap-4 pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='original_word'>
                {t('vocabulary.form.originalWord')} {isCreateMode ? ' *' : ''}
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
                {t('vocabulary.form.translatedWord')} {isCreateMode ? ' *' : ''}
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

          {/* Language Fields (Create only) */}
          {isCreateMode ? (
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='from_language'>
                  {t('vocabulary.form.fromLanguage')} *
                </Label>
                <select
                  id='from_language'
                  value={formData.from_language_id}
                  onChange={e =>
                    handleInputChange(
                      'from_language_id',
                      Number(e.target.value)
                    )
                  }
                  className={`w-full p-2 text-sm border rounded-md ${errors.from_language_id ? 'border-destructive' : ''}`}
                >
                  <option value='' disabled>
                    {t('vocabulary.form.selectLanguage')}
                  </option>
                  {languages.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                {errors.from_language_id && (
                  <p className='text-sm text-destructive'>
                    {errors.from_language_id}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='translated_language'>
                  {t('vocabulary.form.toLanguage')} *
                </Label>
                <select
                  id='translated_language'
                  value={formData.translated_language_id}
                  onChange={e =>
                    handleInputChange(
                      'translated_language_id',
                      Number(e.target.value)
                    )
                  }
                  className={`w-full p-2 text-sm border rounded-md ${errors.translated_language_id ? 'border-destructive' : ''}`}
                >
                  <option value='' disabled>
                    {t('vocabulary.form.selectLanguage')}
                  </option>
                  {languages.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                {errors.translated_language_id && (
                  <p className='text-sm text-destructive'>
                    {errors.translated_language_id}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='text-sm text-muted-foreground'>
              <p>
                <strong>{t('vocabulary.form.languages')}:</strong>{' '}
                {editVocabulary.from_language.name} →{' '}
                {editVocabulary.translated_language.name}
              </p>
            </div>
          )}

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
                {partOfSpeechOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {frequencyLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              onClick={props.onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting ||
                isCheckingDuplicate ||
                Boolean(
                  errors.original_word ||
                    errors.translated_word ||
                    errors.from_language_id ||
                    errors.translated_language_id ||
                    errors.general
                )
              }
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VocabularyUpsertModal;
