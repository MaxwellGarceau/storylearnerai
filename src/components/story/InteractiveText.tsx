import React from 'react';
import WordHighlight from './WordHighlight';

interface InteractiveTextProps {
  text: string;
  className?: string;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className,
}) => {
  // Handle empty text
  if (!text.trim()) {
    return <span className={className} />;
  }

  // Split text into words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  return (
    <span className={className}>
      {words.map((word, index) => {
        // Skip pure whitespace
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        // For words with punctuation, we need to handle them carefully
        const wordMatch = word.match(/^(\w+)(.*)$/);
        if (wordMatch) {
          const [, cleanWord, punctuation] = wordMatch;
          return (
            <span key={index}>
              <WordHighlight word={cleanWord.toLowerCase()}>
                {cleanWord}
              </WordHighlight>
              {punctuation}
            </span>
          );
        }

        // For words without letters (pure punctuation), just return as is
        return <span key={index}>{word}</span>;
      })}
    </span>
  );
};

export default InteractiveText;
