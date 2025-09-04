import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLanguages } from '../../../hooks/useLanguages';
import { useLocalization } from '../../../hooks/useLocalization';
import { VocabularyModalContainer } from './VocabularyModalContainer';
import { ModalHeader } from '../../ui/ModalHeader';
import { FormField } from '../../ui/FormField';
import { FormActions } from '../../ui/FormActions';
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
  currentLanguageId: number;
  currentFromLanguageId: number;
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
    // Language IDs are required in create mode
    from_language_id: isCreateMode ? props.currentFromLanguageId : 0,
    translated_language_id: isCreateMode ? props.currentLanguageId : 0,
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

    // Require original word and different languages before checking
    if (!trimmedOriginal || fromId === toId) {
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
    <VocabularyModalContainer>
      <ModalHeader
        title={
          isCreateMode ? t('vocabulary.save.title') : t('vocabulary.edit.title')
        }
        onClose={props.onClose}
      />

      <form
        onSubmit={e => {
          e.preventDefault();
          void handleSubmit(e);
        }}
        className='space-y-4'
      >
        {/* Word Fields */}
        <div className='grid grid-cols-2 gap-4 pt-4'>
          <FormField
            type='input'
            id='original_word'
            label={t('vocabulary.form.originalWord')}
            value={formData.original_word}
            onChange={value => handleInputChange('original_word', value)}
            placeholder={t('vocabulary.form.originalWordPlaceholder')}
            error={errors.original_word}
            required={isCreateMode}
          />

          <FormField
            type='input'
            id='translated_word'
            label={t('vocabulary.form.translatedWord')}
            value={formData.translated_word}
            onChange={value => handleInputChange('translated_word', value)}
            placeholder={t('vocabulary.form.translatedWordPlaceholder')}
            error={errors.translated_word}
            required={isCreateMode}
          />
        </div>

        {/* Language Fields (Create only) */}
        {isCreateMode ? (
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              type='select'
              id='from_language'
              label={t('vocabulary.form.fromLanguage')}
              value={formData.from_language_id}
              onChange={value => handleInputChange('from_language_id', value)}
              error={errors.from_language_id}
              required
            >
              <option value='' disabled>
                {t('vocabulary.form.selectLanguage')}
              </option>
              {languages.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </FormField>

            <FormField
              type='select'
              id='translated_language'
              label={t('vocabulary.form.toLanguage')}
              value={formData.translated_language_id}
              onChange={value =>
                handleInputChange('translated_language_id', value)
              }
              error={errors.translated_language_id}
              required
            >
              <option value='' disabled>
                {t('vocabulary.form.selectLanguage')}
              </option>
              {languages.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </FormField>
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
        <FormField
          type='textarea'
          id='definition'
          label={t('vocabulary.form.definition')}
          value={formData.definition}
          onChange={value => handleInputChange('definition', value)}
          placeholder={t('vocabulary.form.definitionPlaceholder')}
          rows={3}
        />

        {/* Part of Speech and Frequency */}
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            type='select'
            id='part_of_speech'
            label={t('vocabulary.form.partOfSpeech')}
            value={formData.part_of_speech}
            onChange={value => handleInputChange('part_of_speech', value)}
          >
            <option value=''>{t('vocabulary.form.selectPartOfSpeech')}</option>
            {partOfSpeechOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>

          <FormField
            type='select'
            id='frequency_level'
            label={t('vocabulary.form.frequencyLevel')}
            value={formData.frequency_level}
            onChange={value => handleInputChange('frequency_level', value)}
          >
            <option value=''>{t('vocabulary.form.selectFrequency')}</option>
            {frequencyLevelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>
        </div>

        {/* Context Fields */}
        <FormField
          type='textarea'
          id='original_word_context'
          label={t('vocabulary.form.originalContext')}
          value={formData.original_word_context}
          onChange={value => handleInputChange('original_word_context', value)}
          placeholder={t('vocabulary.form.originalContextPlaceholder')}
          rows={2}
        />

        <FormField
          type='textarea'
          id='translated_word_context'
          label={t('vocabulary.form.translatedContext')}
          value={formData.translated_word_context}
          onChange={value =>
            handleInputChange('translated_word_context', value)
          }
          placeholder={t('vocabulary.form.translatedContextPlaceholder')}
          rows={2}
        />

        {errors.general && (
          <p className='text-sm text-destructive'>{errors.general}</p>
        )}

        <FormActions
          onCancel={props.onClose}
          cancelLabel={t('common.cancel')}
          submitLabel={isSubmitting ? t('common.saving') : t('common.save')}
          isSubmitting={isSubmitting}
          isDisabled={
            isCheckingDuplicate ||
            Boolean(
              errors.original_word ||
                errors.translated_word ||
                errors.from_language_id ||
                errors.translated_language_id ||
                errors.general
            )
          }
        />
      </form>
    </VocabularyModalContainer>
  );
}

export default VocabularyUpsertModal;
