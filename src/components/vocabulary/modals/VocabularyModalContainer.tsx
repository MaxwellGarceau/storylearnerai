import React from 'react';

interface VocabularyModalContainerProps {
  children: React.ReactNode;
}

export function VocabularyModalContainer({
  children,
}: VocabularyModalContainerProps) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !m-0'>
      <div className='bg-background rounded-lg shadow-lg sm:max-w-[500px] m-4 max-h-[90vh] overflow-y-auto p-4 relative'>
        {children}
      </div>
    </div>
  );
}
