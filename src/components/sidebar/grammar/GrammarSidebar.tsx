import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

import BaseSidebar from '../base/BaseSidebar';
import BaseSidebarHeader from '../base/BaseSidebarHeader';

interface GrammarSidebarProps {
  className?: string;
}

const GrammarSidebar: React.FC<GrammarSidebarProps> = ({ className }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const header = (
    <BaseSidebarHeader
      title={t('grammarSidebar.title') || 'Grammar'}
      icon={<BookOpen className='w-5 h-5 text-primary' />}
      onClose={() => setIsOpen(false)}
      t={t}
    />
  );

  const footerText = t('grammarSidebar.footer') || '';

  return (
    <BaseSidebar
      className={className}
      header={header}
      footerText={footerText}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      toggleButtonText={t('grammarSidebar.title') || 'Grammar'}
      toggleButtonIcon={<BookOpen className='w-4 h-4' />}
    >
      {/* Intentionally empty for now */}
    </BaseSidebar>
  );
};

export default GrammarSidebar;


