import React, { ReactNode } from 'react';
import Header from './Header';
import PageContainer from './PageContainer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  maxWidth = '6xl',
}) => {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />
      <main className='flex-1'>
        <PageContainer className={className} maxWidth={maxWidth}>
          {children}
        </PageContainer>
      </main>
    </div>
  );
};

export default PageLayout;
