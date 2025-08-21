// components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { LanguageSelector } from './ui/LanguageSelector';
import {
  User,
  LogIn,
  BookOpen,
  Settings,
  ChevronDown,
  Save,
  Menu,
  X,
} from 'lucide-react';
import { logger } from '../lib/logger';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      setShowMobileMenu(false);
    } catch (error) {
      logger.error('auth', 'Error signing out', { error });
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Logo - responsive sizing */}
        <Link
          to='/'
          className='text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors'
        >
          {t('header.appName')}
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center space-x-6'>
          <Link
            to='/'
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive('/')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {t('navigation.home')}
          </Link>
          <Link
            to='/translate'
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive('/translate')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {t('navigation.translate')}
          </Link>

          {user && (
            <>
              <Link
                to='/dashboard'
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/dashboard')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                to='/saved-translations'
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/saved-translations')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {t('navigation.saved')}
              </Link>
            </>
          )}
        </nav>

        {/* Desktop User Menu */}
        <div className='hidden md:flex items-center space-x-4'>
          <LanguageSelector variant='button' />
          {user ? (
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 transition-colors'
              >
                <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                  <User className='h-4 w-4 text-primary' />
                </div>
                <span className='hidden sm:inline'>
                  {user.email?.split('@')[0] ?? 'User'}
                </span>
                <ChevronDown className='h-4 w-4' />
              </button>

              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-1 z-50'>
                  <Link
                    to='/dashboard'
                    className='flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors'
                    onClick={() => setShowUserMenu(false)}
                  >
                    <BookOpen className='h-4 w-4 mr-2' />
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    to='/saved-translations'
                    className='flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors'
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Save className='h-4 w-4 mr-2' />
                    {t('story.savedTranslations')}
                  </Link>
                  <Link
                    to='/auth?mode=profile'
                    className='flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors'
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className='h-4 w-4 mr-2' />
                    {t('navigation.profile')}
                  </Link>
                  <button
                    onClick={() => void handleSignOut()}
                    className='flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors'
                  >
                    <LogIn className='h-4 w-4 mr-2' />
                    {t('navigation.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' asChild>
                <Link to='/auth?mode=signin' data-testid='sign-in-link'>
                  <LogIn className='h-4 w-4 mr-2' />
                  {t('navigation.signIn')}
                </Link>
              </Button>
              <Button size='sm' asChild>
                <Link to='/auth?mode=signup' data-testid='sign-up-link'>
                  <User className='h-4 w-4 mr-2' />
                  {t('navigation.signUp')}
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden flex items-center space-x-2'>
          <LanguageSelector variant='button' />
          {user && (
            <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
              <User className='h-4 w-4 text-primary' />
            </div>
          )}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className='p-2 rounded-md text-foreground hover:bg-accent/50 transition-colors'
            aria-label={t('header.toggleMobileMenu')}
          >
            {showMobileMenu ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className='md:hidden border-t bg-background/95 backdrop-blur'>
          <div className='container mx-auto px-4 py-4 space-y-2'>
            {/* Mobile Navigation Links */}
            <Link
              to='/'
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              onClick={closeMobileMenu}
            >
              {t('navigation.home')}
            </Link>
            <Link
              to='/translate'
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/translate')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              onClick={closeMobileMenu}
            >
              {t('navigation.translate')}
            </Link>

            {user && (
              <>
                <Link
                  to='/dashboard'
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive('/dashboard')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                  onClick={closeMobileMenu}
                >
                  {t('navigation.dashboard')}
                </Link>
                <Link
                  to='/saved-translations'
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive('/saved-translations')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                  onClick={closeMobileMenu}
                >
                  {t('story.savedTranslations')}
                </Link>
                <Link
                  to='/auth?mode=profile'
                  className='flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md'
                  onClick={closeMobileMenu}
                >
                  <Settings className='h-4 w-4 mr-2' />
                  {t('navigation.profile')}
                </Link>
                <button
                  onClick={() => void handleSignOut()}
                  className='flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md'
                >
                  <LogIn className='h-4 w-4 mr-2' />
                  {t('navigation.signOut')}
                </button>
              </>
            )}

            {/* Mobile Auth Buttons */}
            {!user && (
              <div className='flex flex-col space-y-2 pt-2 border-t'>
                <Button variant='outline' size='sm' asChild className='w-full'>
                  <Link
                    to='/auth?mode=signin'
                    data-testid='sign-in-link'
                    onClick={closeMobileMenu}
                  >
                    <LogIn className='h-4 w-4 mr-2' />
                    {t('navigation.signIn')}
                  </Link>
                </Button>
                <Button size='sm' asChild className='w-full'>
                  <Link
                    to='/auth?mode=signup'
                    data-testid='sign-up-link'
                    onClick={closeMobileMenu}
                  >
                    <User className='h-4 w-4 mr-2' />
                    {t('navigation.signUp')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
