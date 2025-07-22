// components/Layout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-4 md:mx-8 lg:mx-16 xl:mx-24 p-4">{children}</main>
    </div>
  );
};

export default Layout;
