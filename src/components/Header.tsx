// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 md:px-8 lg:px-16 xl:px-24 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
        Header
      </h1>
    </header>
  );
};

export default Header;
