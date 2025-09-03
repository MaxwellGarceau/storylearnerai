import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { BookOpen } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

interface VocabularyEmptyStateProps {
  showNoResults: boolean;
}

export function VocabularyEmptyState({ showNoResults }: VocabularyEmptyStateProps) {
  const { t } = useLocalization();

  return (
    <Card>
      <CardContent className='p-4 text-center'>
        <BookOpen className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
        <p className='text-sm text-muted-foreground'>
          {showNoResults ? t('vocabulary.noResults') : t('vocabulary.empty.sidebar')}
        </p>
      </CardContent>
    </Card>
  );
}

export default VocabularyEmptyState;


