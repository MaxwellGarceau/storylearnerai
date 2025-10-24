import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

import BaseSidebar from '../base/BaseSidebar';
import BaseSidebarHeader from '../base/BaseSidebarHeader';

interface GrammarSidebarProps {
  className?: string;
  isOpen?: boolean;
  onOpen?: () => void;
  hideToggle?: boolean;
  onRequestClose?: () => void;
}

const GrammarSidebar: React.FC<GrammarSidebarProps> = ({
  className,
  isOpen: controlledIsOpen,
  onOpen: controlledOnOpen,
  hideToggle,
  onRequestClose,
}) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const header = (
    <BaseSidebarHeader
      title={t('grammarSidebar.title') || 'Grammar'}
      icon={<BookOpen className='w-5 h-5 text-primary' />}
      onClose={() => (onRequestClose ? onRequestClose() : setInternalIsOpen(false))}
      t={t}
    />
  );

  const footerText = t('grammarSidebar.footer') || '';

  return (
    <BaseSidebar
      className={className}
      header={header}
      footerText={footerText}
      isOpen={controlledIsOpen ?? internalIsOpen}
      onOpen={controlledOnOpen ?? (() => setInternalIsOpen(true))}
      toggleButtonText={t('grammarSidebar.title') || 'Grammar'}
      toggleButtonIcon={<BookOpen className='w-4 h-4' />}
      toggleContainerClassName='top-32'
      hideToggle={hideToggle}
    >
      <div />
    </BaseSidebar>
  );
};

export default GrammarSidebar;


