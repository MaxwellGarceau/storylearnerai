import React, { useState } from 'react';
import StoryUploadForm from './StoryUploadForm';
import StoryRender from './StoryRender'; // Adjust the import path

const StoryContainer: React.FC = () => {
  const [submittedStory, setSubmittedStory] = useState<string | null>(null);

  const handleStorySubmit = (story: string) => {
    setSubmittedStory(story);
  };

  return (
    <div className="space-y-6">
      <StoryUploadForm onSubmitStory={handleStorySubmit} />
      {submittedStory && <StoryRender content={submittedStory} />}
    </div>
  );
};

export default StoryContainer;
