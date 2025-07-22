// components/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Story Learner AI
        </Link>
        
        <nav className="flex space-x-6">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/translate" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/translate') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Translate
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
