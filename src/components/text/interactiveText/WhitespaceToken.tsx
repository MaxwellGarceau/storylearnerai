import React from 'react';

interface WhitespaceTokenProps {
  value: string;
}

/**
 * Renders a whitespace token
 * Simple pass-through component for consistency with token architecture
 */
const WhitespaceToken: React.FC<WhitespaceTokenProps> = ({ value }) => {
  return <span>{value}</span>;
};

export default WhitespaceToken;
