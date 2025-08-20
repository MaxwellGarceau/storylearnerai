import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoBox } from '../ui/InfoBox';
import { AlertTriangle } from 'lucide-react';

interface RequirementsInfoBoxProps {
  maxFileSize: number;
  maxPages: number;
}

export const RequirementsInfoBox: React.FC<RequirementsInfoBoxProps> = ({
  maxFileSize,
  maxPages
}) => {
  const { t } = useTranslation();

  return (
    <InfoBox
      variant="info"
      title={t('pdfUpload.requirements.title')}
      icon={<AlertTriangle className="w-4 h-4" />}
    >
      <ul className="space-y-1 text-xs">
        <li>• {t('pdfUpload.requirements.maxSize', { maxSize: maxFileSize })}</li>
        <li>• {t('pdfUpload.requirements.maxPages', { maxPages })}</li>
        <li>• {t('pdfUpload.requirements.pdfOnly')}</li>
        <li>• {t('pdfUpload.requirements.textContent')}</li>
      </ul>
    </InfoBox>
  );
};
