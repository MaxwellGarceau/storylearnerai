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
    <header className="w-full py-4 bg-background border-b border-border">
      <div className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
          Story Learner AI
        </Link>
        
        <nav className="flex space-x-6">
          <Link 
            to="/" 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/') 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground"
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
                : "text-muted-foreground hover:text-foreground"
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
