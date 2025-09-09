import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select';
import { Button } from '../ui/Button';
import TextArea from '../ui/TextArea';
import Label from '../ui/Label';
import { useLanguages } from '../../hooks/useLanguages';
import { StoryFormData } from '../types/story';
import { useTranslation } from 'react-i18next';

interface StoryUploadFormProps {
  onSubmitStory: (storyData: {
    story: string;
    language: string;
    difficulty: string;
  }) => void;
}

const StoryUploadForm: React.FC<StoryUploadFormProps> = ({ onSubmitStory }) => {
  const { getLanguageName } = useLanguages();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<StoryFormData>({
    story: '',
    fromLanguage: 'es', // Source language (Spanish)
    language: 'en', // Target language (always English for now)
    difficulty: 'a1',
    selectedVocabulary: [],
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      story: event.target.value,
    }));
  };

  const handleSelectChange = (
    field: 'language' | 'difficulty',
    value: string
  ) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value || prevFormData[field],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmitStory(formData); // Pass the complete form data
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='p-4 space-y-4 bg-white shadow-lg rounded-lg'
    >
      <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
        <p className='text-sm text-blue-800'>
          <strong>{t('storyInput.translation')}</strong> {getLanguageName('es')}{' '}
          → {getLanguageName('en')}
        </p>
        <p className='text-xs text-blue-600 mt-1'>
          {t('storyInput.enterYour')} {getLanguageName('es')}{' '}
          {t('storyInput.storyBelowAndItWillBeTranslatedTo')}{' '}
          {getLanguageName('en')}{' '}
          {t('storyInput.atYourSelectedDifficultyLevel')}
        </p>
      </div>

      <TextArea
        id='storyUpload-story'
        name='storyUpload-story'
        value={formData.story}
        onChange={handleInputChange}
        placeholder={t('storyInput.placeholder')}
        required
        label={`${getLanguageName('es')} Story`}
        helperText={`Write or paste the ${getLanguageName('es')} story text you wish to translate to ${getLanguageName('en')}.`}
      />

      <div>
        <Label htmlFor='storyUpload-language'>
          {t('storyInput.targetLanguage')}
        </Label>
        <Select
          name='storyUpload-language'
          value={formData.language}
          onValueChange={value => handleSelectChange('language', value)}
        >
          <SelectTrigger
            id='storyUpload-language'
            aria-label='Select target language'
            className='mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200'
          >
            {formData.language}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='en'>{getLanguageName('en')}</SelectItem>
          </SelectContent>
        </Select>
        <p className='text-xs text-gray-500 mt-1'>
          {t('storyInput.currentlyOnly')} {getLanguageName('en')}{' '}
          {t('storyInput.translationIsSupported')}
        </p>
      </div>

      <div>
        <Label htmlFor='storyUpload-difficulty'>Target Difficulty (CEFR)</Label>
        <Select
          name='storyUpload-difficulty'
          value={formData.difficulty}
          onValueChange={value => handleSelectChange('difficulty', value)}
        >
          <SelectTrigger
            id='storyUpload-difficulty'
            aria-label='Select difficulty level'
            className='mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200'
          >
            {formData.difficulty}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='a1'>{t('difficultyLevels.a1.label')}</SelectItem>
            <SelectItem value='a2'>{t('difficultyLevels.a2.label')}</SelectItem>
            <SelectItem value='b1'>{t('difficultyLevels.b1.label')}</SelectItem>
            <SelectItem value='b2'>{t('difficultyLevels.b2.label')}</SelectItem>
          </SelectContent>
        </Select>
        <p className='text-xs text-gray-500 mt-1'>
          {t('storyInput.theStoryWillBeAdaptedToThis')} {getLanguageName('en')}{' '}
          {t('storyInput.proficiencyLevel')}
        </p>
      </div>

      <Button
        type='submit'
        className='w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:ring focus:ring-indigo-300'
      >
        {t('storyInput.targetStory')}
      </Button>
    </form>
  );
};

export default StoryUploadForm;
