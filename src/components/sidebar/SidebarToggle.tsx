import React from 'react';
import { Button } from '../ui/Button';
import { BookOpen } from 'lucide-react';
import type { TFunction } from 'i18next';

interface SidebarToggleProps {
  onOpen: () => void;
  t: TFunction;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ onOpen, t }) => {
  return (
    <div className='fixed top-20 left-4 z-50'>
      <Button
        variant='outline'
        size='default'
        onClick={onOpen}
        className='inline-flex items-center gap-2 shadow-lg bg-background/80 backdrop-blur-sm'
        aria-label={t('storySidebar.openLibrary')}
      >
        <BookOpen className='w-4 h-4' />
        <span className='hidden sm:inline'>
          {t('storySidebar.storyLibrary')}
        </span>
      </Button>
    </div>
  );
};

export default SidebarToggle;
