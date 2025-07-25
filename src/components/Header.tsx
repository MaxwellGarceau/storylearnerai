// components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSupabase } from '../hooks/useSupabase';
import { Button } from './ui/Button';
import { 
  User, 
  LogIn, 
  BookOpen, 
  Settings,
  ChevronDown,
  Save
} from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useSupabase();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
          Story Learner AI
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/') 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            Home
          </Link>
          <Link 
            to="/translate" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/translate') 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            Translate
          </Link>
          
          {user && (
            <>
              <Link 
                to="/dashboard" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive('/dashboard') 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Dashboard
              </Link>
              <Link 
                to="/saved-translations" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive('/saved-translations') 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Saved
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline">
                  {user.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/saved-translations"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Saved Translations
                  </Link>
                  <Link
                    to="/auth?mode=profile"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/auth?mode=signin" data-testid="sign-in-link">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
              >
                <Link to="/auth?mode=signup" data-testid="sign-up-link">
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
