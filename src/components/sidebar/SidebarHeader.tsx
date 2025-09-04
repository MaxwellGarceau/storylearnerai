import React from 'react';
import { Button } from '../ui/Button';
import { X, BookOpen, Settings, BookMarked } from 'lucide-react';
import type { TFunction } from 'i18next';

type ActiveSection = 'stories' | 'vocabulary' | 'info';

interface SidebarHeaderProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  onClose: () => void;
  t: TFunction;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  activeSection,
  setActiveSection,
  onClose,
  t,
}) => {
  return (
    <div className='p-4 border-b bg-muted/50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BookOpen className='w-5 h-5 text-primary' />
          <h2 className='text-lg font-semibold'>
            {t('storySidebar.storyLibrary')}
          </h2>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='h-8 w-8 p-0'
          aria-label={t('storySidebar.closeLibrary')}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex gap-1 mt-3 flex-wrap'>
        <Button
          variant={activeSection === 'stories' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('stories')}
          className='flex-1'
        >
          <BookOpen className='w-4 h-4 mr-2' />
          {t('storySidebar.stories')}
        </Button>
        <Button
          variant={activeSection === 'vocabulary' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('vocabulary')}
          className='flex-1'
        >
          <BookMarked className='w-4 h-4 mr-2' />
          {t('storySidebar.vocabulary')}
        </Button>
        <Button
          variant={activeSection === 'info' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => setActiveSection('info')}
          className='flex-1'
        >
          <Settings className='w-4 h-4 mr-2' />
          {t('storySidebar.info')}
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
