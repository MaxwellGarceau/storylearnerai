import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode } from '../types/llm/prompts';

interface LanguageContextType {
  fromLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  setFromLanguage: (language: LanguageCode) => void;
  setTargetLanguage: (language: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
  initialFromLanguage?: LanguageCode;
  initialTargetLanguage?: LanguageCode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialFromLanguage = 'es', // Default to Spanish as source language
  initialTargetLanguage = 'en', // Default to English as target language
}) => {
  const [fromLanguage, setFromLanguage] =
    useState<LanguageCode>(initialFromLanguage);
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(
    initialTargetLanguage
  );

  const value: LanguageContextType = {
    fromLanguage,
    targetLanguage,
    setFromLanguage,
    setTargetLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
