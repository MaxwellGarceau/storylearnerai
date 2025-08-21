// components/Layout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />
      <main className='flex-1'>{children}</main>
    </div>
  );
};

export default Layout;
