import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoBox } from '../ui/InfoBox';

export const BestPracticesInfoBox: React.FC = () => {
  const { t } = useTranslation();

  const CheckIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );

  return (
    <InfoBox
      variant="success"
      title={t('pdfUpload.bestPractices.title')}
      icon={<CheckIcon />}
    >
      <ul className="space-y-1 text-xs">
        <li>• {t('pdfUpload.bestPractices.extractableText')}</li>
        <li>• {t('pdfUpload.bestPractices.storyContent')}</li>
        <li>• {t('pdfUpload.bestPractices.avoidImages')}</li>
        <li>• {t('pdfUpload.bestPractices.cleanFormat')}</li>
      </ul>
    </InfoBox>
  );
};
