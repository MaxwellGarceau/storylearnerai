import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Button } from '../ui/Button';
import TextArea from '../ui/TextArea';
import Label from '../ui/Label';
import { StoryFormData } from '../types/story';

interface StoryUploadFormProps {
  onSubmitStory: (storyData: { story: string; language: string; difficulty: string }) => void;
}

const StoryUploadForm: React.FC<StoryUploadFormProps> = ({ onSubmitStory }) => {
  const [formData, setFormData] = useState<StoryFormData>({
    story: '',
    language: 'en', // Target language (always English for now)
    difficulty: 'a1',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      story: event.target.value,
    }));
  };

  const handleSelectChange = (field: 'language' | 'difficulty', value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value || prevFormData[field],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmitStory(formData); // Pass the complete form data
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white shadow-lg rounded-lg">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Translation:</strong> Spanish → English
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Enter your Spanish story below, and it will be translated to English at your selected difficulty level.
        </p>
      </div>

      <TextArea
        id="storyUpload-story"
        name="storyUpload-story"
        value={formData.story}
        onChange={handleInputChange}
        placeholder="Ingresa tu historia en español aquí... (Enter your Spanish story here...)"
        required
        label="Spanish Story"
        helperText="Write or paste the Spanish story text you wish to translate to English."
      />

      <div>
        <Label htmlFor="storyUpload-language">Target Language</Label>
        <Select name="storyUpload-language" value={formData.language} onValueChange={(value) => handleSelectChange('language', value)}>
          <SelectTrigger
            id="storyUpload-language"
            aria-label="Select target language"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          >
            {formData.language}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Currently only English translation is supported.
        </p>
      </div>

      <div>
        <Label htmlFor="storyUpload-difficulty">Target Difficulty (CEFR)</Label>
        <Select name="storyUpload-difficulty" value={formData.difficulty} onValueChange={(value) => handleSelectChange('difficulty', value)}>
          <SelectTrigger
            id="storyUpload-difficulty"
            aria-label="Select difficulty level"
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
          >
            {formData.difficulty}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a1">A1 (Beginner)</SelectItem>
            <SelectItem value="a2">A2 (Elementary)</SelectItem>
            <SelectItem value="b1">B1 (Intermediate)</SelectItem>
            <SelectItem value="b2">B2 (Upper Intermediate)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          The story will be adapted to this English proficiency level.
        </p>
      </div>

      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:ring focus:ring-indigo-300">
        Translate Story
      </Button>
    </form>
  );
};

export default StoryUploadForm;
