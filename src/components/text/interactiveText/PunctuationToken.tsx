import React from 'react';

interface PunctuationTokenProps {
  value: string;
}

/**
 * Renders a punctuation token
 * Simple pass-through component for consistency with token architecture
 */
const PunctuationToken: React.FC<PunctuationTokenProps> = ({ value }) => {
  return <span>{value}</span>;
};

export default PunctuationToken;
