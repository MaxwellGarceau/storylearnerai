import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { TFunction } from 'i18next';

interface AuthPromptProps {
  t: TFunction;
  variant?: 'button' | 'link';
  className?: string;
  messageClassName?: string;
  buttonClassName?: string;
  linkClassName?: string;
  containerClassName?: string;
}

/**
 * AuthPrompt component for prompting users to sign up or login when not authenticated
 * Supports different styling variants for different contexts
 */
export function AuthPrompt({
  t,
  variant = 'button',
  className,
  messageClassName,
  buttonClassName,
  linkClassName,
  containerClassName,
}: AuthPromptProps) {
  const renderContent = () => {
    if (variant === 'button') {
      return (
        <div className={cn('text-center py-6 space-y-4', containerClassName)}>
          <p className={cn('text-sm text-muted-foreground', messageClassName)}>
            {t('wordMenu.guest.message')}
          </p>
          <div className='flex flex-col items-center gap-3'>
            <Link
              to='/auth?mode=signup'
              className={cn(
                'inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors',
                buttonClassName
              )}
            >
              {t('wordMenu.guest.cta')}
            </Link>
            <Link
              to='/auth?mode=signin'
              className={cn(
                'block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 text-center',
                linkClassName
              )}
            >
              {t('navigation.signIn')}
            </Link>
          </div>
        </div>
      );
    }

    if (variant === 'link') {
      return (
        <div
          className={cn(
            'text-center text-sm text-muted-foreground space-y-2 max-w-[320px]',
            containerClassName
          )}
        >
          <p className={messageClassName}>{t('wordMenu.guest.message')}</p>
          <div className='flex flex-col items-center gap-2'>
            <Link
              to='/auth?mode=signup'
              className={cn(
                'block text-primary underline underline-offset-4 font-medium text-center',
                linkClassName
              )}
            >
              {t('wordMenu.guest.cta')}
            </Link>
            <Link
              to='/auth?mode=signin'
              className={cn(
                'block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 text-center',
                linkClassName
              )}
            >
              {t('navigation.signIn')}
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return <div className={className}>{renderContent()}</div>;
}

export default AuthPrompt;
