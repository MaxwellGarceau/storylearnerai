// components/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
