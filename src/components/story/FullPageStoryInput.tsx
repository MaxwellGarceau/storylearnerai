import React from 'react';

interface FullPageStoryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FullPageStoryInput: React.FC<FullPageStoryInputProps> = ({
  value,
  onChange,
  placeholder = "Ingresa tu historia en español aquí... (Enter your Spanish story here...)"
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Translate Your Story</h1>
        <p className="text-gray-600 text-lg">
          Enter a story in Spanish and we'll translate it to English
        </p>
      </div>

      {/* Full-page text area */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <textarea
            id="fullpage-story-input"
            name="fullpage-story-input"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full h-full min-h-[calc(100vh-200px)] resize-none border-0 focus:ring-0 focus:border-0 p-6 text-lg leading-relaxed bg-transparent"
            style={{
              minHeight: 'calc(100vh - 200px)',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.8',
            }}
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>
          💡 Tip: You can paste long stories, articles, or any Spanish text you'd like to translate
        </p>
      </div>
    </div>
  );
};

export default FullPageStoryInput; 