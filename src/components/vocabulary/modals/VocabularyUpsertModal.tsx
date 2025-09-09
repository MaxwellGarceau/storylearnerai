import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLanguages } from '../../../hooks/useLanguages';
import { useLocalization } from '../../../hooks/useLocalization';
import { VocabularyModalContainer } from './VocabularyModalContainer';
import { ModalHeader } from '../../ui/ModalHeader';
import { TextField } from '../../ui/form/TextField';
import { TextareaField } from '../../ui/form/TextareaField';
import { SelectField } from '../../ui/form/SelectField';
import { FormActions } from '../../ui/form/FormActions';
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
    from_word: isCreateMode
      ? (props.initialData?.originalWord ?? '')
      : editVocabulary.from_word,
    target_word: isCreateMode
      ? (props.initialData?.translatedWord ?? '')
      : editVocabulary.target_word,
    // Language IDs are required in create mode
    from_language_id: isCreateMode ? props.currentFromLanguageId : 0,
    target_language_id: isCreateMode ? props.currentLanguageId : 0,
    from_word_context: isCreateMode
      ? (props.initialData?.originalContext ?? '')
      : (editVocabulary.from_word_context ?? ''),
    target_word_context: isCreateMode
      ? (props.initialData?.translatedContext ?? '')
      : (editVocabulary.target_word_context ?? ''),
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

    if (!formData.from_word.trim()) {
      newErrors.from_word = t('vocabulary.validation.fromWordRequired');
    }

    if (!formData.target_word.trim()) {
      newErrors.target_word = t('vocabulary.validation.targetWordRequired');
    }

    if (isCreateMode) {
      // Prevent same language pair
      if (
        formData.from_language_id &&
        formData.target_language_id &&
        formData.from_language_id === formData.target_language_id
      ) {
        const msg = t('vocabulary.validation.languagesMustDiffer');
        newErrors.from_language_id = msg;
        newErrors.target_language_id = msg;
      }

      const trimmedOriginalLower = formData.from_word.trim().toLowerCase();
      if (trimmedOriginalLower) {
        const existsLocal = userVocabulary.some(
          v => v.from_word.trim().toLowerCase() === trimmedOriginalLower
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
          from_word: formData.from_word.trim(),
          target_word: formData.target_word.trim(),
          from_language_id: formData.from_language_id,
          target_language_id: formData.target_language_id,
          from_word_context: formData.from_word_context.trim() || null,
          target_word_context: formData.target_word_context.trim() || null,
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
          from_word: formData.from_word.trim(),
          target_word: formData.target_word.trim(),
          from_word_context: formData.from_word_context.trim() || null,
          target_word_context: formData.target_word_context.trim() || null,
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

    const trimmedOriginal = formData.from_word.trim();
    const fromId = formData.from_language_id;
    const toId = formData.target_language_id;

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
              v.from_word.trim().toLowerCase() === trimmedOriginal.toLowerCase()
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
    formData.from_word,
    formData.from_language_id,
    formData.target_language_id,
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
          <TextField
            id='from_word'
            label={t('vocabulary.form.fromWord')}
            value={formData.from_word}
            onChange={value => handleInputChange('from_word', value)}
            placeholder={t('vocabulary.form.fromWordPlaceholder')}
            error={errors.from_word}
            required={isCreateMode}
          />

          <TextField
            id='target_word'
            label={t('vocabulary.form.targetWord')}
            value={formData.target_word}
            onChange={value => handleInputChange('target_word', value)}
            placeholder={t('vocabulary.form.targetWordPlaceholder')}
            error={errors.target_word}
            required={isCreateMode}
          />
        </div>

        {/* Language Fields (Create only) */}
        {isCreateMode ? (
          <div className='grid grid-cols-2 gap-4'>
            <SelectField
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
            </SelectField>

            <SelectField
              id='target_language'
              label={t('vocabulary.form.toLanguage')}
              value={formData.target_language_id}
              onChange={value => handleInputChange('target_language_id', value)}
              error={errors.target_language_id}
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
            </SelectField>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>
            <p>
              <strong>{t('vocabulary.form.languages')}:</strong>{' '}
              {editVocabulary.from_language.name} →{' '}
              {editVocabulary.target_language.name}
            </p>
          </div>
        )}

        {/* Definition */}
        <TextareaField
          id='definition'
          label={t('vocabulary.form.definition')}
          value={formData.definition}
          onChange={value => handleInputChange('definition', value)}
          placeholder={t('vocabulary.form.definitionPlaceholder')}
          rows={3}
        />

        {/* Part of Speech and Frequency */}
        <div className='grid grid-cols-2 gap-4'>
          <SelectField
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
          </SelectField>

          <SelectField
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
          </SelectField>
        </div>

        {/* Context Fields */}
        <TextareaField
          id='from_word_context'
          label={t('vocabulary.form.fromContext')}
          value={formData.from_word_context}
          onChange={value => handleInputChange('from_word_context', value)}
          placeholder={t('vocabulary.form.fromContextPlaceholder')}
          rows={2}
        />

        <TextareaField
          id='target_word_context'
          label={t('vocabulary.form.targetContext')}
          value={formData.target_word_context}
          onChange={value => handleInputChange('target_word_context', value)}
          placeholder={t('vocabulary.form.targetContextPlaceholder')}
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
              errors.from_word ||
                errors.target_word ||
                errors.from_language_id ||
                errors.target_language_id ||
                errors.general
            )
          }
        />
      </form>
    </VocabularyModalContainer>
  );
}

export default VocabularyUpsertModal;
