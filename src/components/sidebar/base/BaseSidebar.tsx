import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { useViewport } from '../../../hooks/useViewport';
import { logger } from '../../../lib/logger';
import { useTranslation } from 'react-i18next';
import SidebarToggle from './SidebarToggle';

interface BaseSidebarProps {
  className?: string;
  children: React.ReactNode;
  header: React.ReactNode;
  footerText: string;
  toggleButtonText?: string;
  toggleButtonIcon?: React.ReactNode;
  toggleContainerClassName?: string;
  isOpen?: boolean;
  onOpen?: () => void;
}

const BaseSidebar: React.FC<BaseSidebarProps> = ({
  className,
  children,
  header,
  footerText,
  toggleButtonText,
  toggleButtonIcon,
  toggleContainerClassName,
  isOpen: externalIsOpen,
  onOpen: externalOnOpen,
}) => {
  const { isMobile } = useViewport();
  const { t } = useTranslation();

  const getInitialSidebarState = (): boolean => {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        return JSON.parse(saved) as boolean;
      }
      return !isMobile;
    } catch (error) {
      logger.warn('ui', 'Failed to read sidebar state from localStorage', {
        error,
      });
      return !isMobile;
    }
  };

  const [internalIsOpen, setInternalIsOpen] = useState(getInitialSidebarState);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen ?? internalIsOpen;
  const setIsOpen = externalOnOpen ?? setInternalIsOpen;

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    } catch (error) {
      logger.warn('ui', 'Failed to save sidebar state to localStorage', {
        error,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved === null && externalIsOpen === undefined) {
      setInternalIsOpen(!isMobile);
    }
  }, [isMobile, externalIsOpen]);

  return (
    <>
      {!isOpen && (
        <SidebarToggle
          onOpen={() => setIsOpen(true)}
          t={t}
          customText={toggleButtonText}
          customIcon={toggleButtonIcon}
          containerClassName={toggleContainerClassName}
        />
      )}

      <div
        className={cn(
          'fixed top-16 left-0 z-40 w-80 max-w-[calc(100vw-16px)] h-[calc(100vh-64px)]',
          'bg-background border-r shadow-lg transition-all duration-300',
          'overflow-hidden',
          isOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0 pointer-events-none',
          className
        )}
      >
        <div className='h-full flex flex-col'>
          {header}

          <div className='flex-1 overflow-y-auto'>{children}</div>

          <div className='p-4 border-t bg-muted/30'>
            <p className='text-xs text-muted-foreground text-center'>
              {footerText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseSidebar;
