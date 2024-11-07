import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Button } from './ui/Button';
import TextArea from './ui/TextArea'; // Assuming this is in the same directory or adjust path accordingly

const StoryUploadForm: React.FC = () => {
  const [formData, setFormData] = useState({
    story: '',
    language: 'English',
    difficulty: 'A1',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prevFormData => (
      {
        ...prevFormData,
        story: event.target.value
      }
    ));
  };

  const handleSelectChange = (field: 'language' | 'difficulty', value: string) => {
    setFormData(prevFormData => (
      {
        ...prevFormData,
        [field]: value
      }
    ));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
  };
  
  console.log(formData);
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white shadow-lg rounded-lg">
      <TextArea
        id="story"
        value={formData.story}
        onChange={handleInputChange}
        placeholder="Enter your story here"
        required
        label="Story"
        helperText="Write or paste the story text you wish to translate."
      />

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Translation Language
        </label>
        <Select value={formData.language} onValueChange={(value) => handleSelectChange('language', value)}>
          <SelectTrigger aria-label="Select translation language" className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200">
            {formData.language}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
          Story Difficulty (CEFR)
        </label>
        <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange('difficulty', value)}>
          <SelectTrigger aria-label="Select difficulty level" className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200">
            {formData.difficulty}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A1">A1</SelectItem>
            <SelectItem value="A2">A2</SelectItem>
            <SelectItem value="B1">B1</SelectItem>
            <SelectItem value="B2">B2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:ring focus:ring-indigo-300">
        Submit
      </Button>
    </form>
  );
};

export default StoryUploadForm;
