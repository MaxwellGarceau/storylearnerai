import React from 'react';
import { useDictionaryEntryContext } from './Context';
import DictionaryEntry from './DictionaryEntry';

// Content component that renders the appropriate state
export interface DictionaryEntryContentProps {
  children?: React.ReactNode;
}

const DictionaryEntryContent: React.FC<DictionaryEntryContentProps> = ({
  children,
}) => {
  const { isLoading, error, wordInfo } = useDictionaryEntryContext();

  if (isLoading) {
    return <DictionaryEntry.LoadingMessage />;
  }

  if (error) {
    return <DictionaryEntry.ErrorMessage />;
  }

  if (wordInfo) {
    return (
      children ?? (
        <>
          <DictionaryEntry.Header />
          <DictionaryEntry.Definition />
          <DictionaryEntry.AdditionalInfo />
          <DictionaryEntry.Source />
        </>
      )
    );
  }

  return <DictionaryEntry.DefaultMessage />;
};

export default DictionaryEntryContent;
