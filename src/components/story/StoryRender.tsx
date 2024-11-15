import React from 'react';

interface StoryProps {
  content: string;
}

const Story: React.FC<StoryProps> = ({ content }) => {
  if (!content) {
    return null; // Don't render if no content is provided
  }

  return (
    <div className="mt-4 p-4 border rounded bg-gray-100">
      <h2 className="text-lg font-semibold mb-2">Submitted Story:</h2>
      <p>{content}</p>
    </div>
  );
};

export default Story;
