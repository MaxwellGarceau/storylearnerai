import React from 'react';
import { TranslationToken } from '../../../types/llm/tokens';
import WordToken from './WordToken';
import { useStoryContext } from '../../../contexts/StoryContext';

interface InteractiveTextViewProps {
  className?: string;
  tokens: TranslationToken[];
  enableTooltips: boolean;
  disabled: boolean;
}

const InteractiveTextView: React.FC<InteractiveTextViewProps> = ({
  className,
  tokens,
  enableTooltips,
  disabled,
}) => {
  const { isDisplayingFromSide } = useStoryContext();

  // Early return for no tokens
  if (tokens.length === 0) return <span className={className} />;

  return (
    <span className={className}>
      {tokens.map((token, index) => {
        if (token.type === 'word') {
          // Choose the appropriate word based on display side
          const displayWord = isDisplayingFromSide
            ? token.from_word
            : token.to_word;

          return (
            <WordToken
              key={`${displayWord}-${index}`}
              word={displayWord}
              position={index}
              punctuation={''} // Will be handled by next token
              disabled={disabled}
              enableTooltips={enableTooltips}
            />
          );
        } else if (token.type === 'punctuation') {
          return <span key={`punctuation-${index}`}>{token.value}</span>;
        } else if (token.type === 'whitespace') {
          return <span key={`whitespace-${index}`}>{token.value}</span>;
        }
        return null;
      })}
    </span>
  );
};

export default InteractiveTextView;
