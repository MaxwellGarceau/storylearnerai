import React from 'react';
import { useTranslation } from 'react-i18next';

interface NoTranslationDataMessageProps {
  className?: string;
}

const NoTranslationDataMessage: React.FC<NoTranslationDataMessageProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 text-center ${className}`}>
      <p className='text-muted-foreground'>
        {t('storySidebar.noTranslationData')}
      </p>
    </div>
  );
};

export default NoTranslationDataMessage;
