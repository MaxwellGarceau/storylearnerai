import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Edit, Trash2, Search, BookOpen, Calendar } from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLanguages } from '../../hooks/useLanguages';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';

import { useLocalization } from '../../hooks/useLocalization';

interface VocabularyListProps {
  className?: string;
}

export function VocabularyList({ className }: VocabularyListProps) {
  const { t } = useLocalization();
  const { vocabulary, loading } = useVocabulary();
  const { languages } = useLanguages();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVocabulary, setFilteredVocabulary] = useState<
    VocabularyWithLanguages[]
  >([]);

  // Filter vocabulary based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVocabulary(vocabulary);
    } else {
      const filtered = vocabulary.filter(
        item =>
          item.original_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.translated_word.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVocabulary(filtered);
    }
  }, [vocabulary, searchTerm]);

  const getLanguageName = (languageId: number) => {
    const language = languages.find(lang => lang.id === languageId);
    return language?.name ?? 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <span className='ml-2'>{t('loading')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className='p-6 text-center'>
            <BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {t('vocabulary.empty.title')}
            </h3>
            <p className='text-muted-foreground mb-4'>
              {t('vocabulary.empty.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <input
          type='text'
          placeholder={t('vocabulary.search.placeholder')}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className='w-full pl-10 pr-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        />
      </div>

      {/* Vocabulary List */}
      <div className='space-y-3'>
        {filteredVocabulary.map(item => (
          <Card key={item.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-lg'>
                      {item.original_word}
                    </span>
                    <span className='text-muted-foreground'>→</span>
                    <span className='font-medium text-lg'>
                      {item.translated_word}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Badge variant='outline'>
                      {getLanguageName(item.from_language_id)} →{' '}
                      {getLanguageName(item.translated_language_id)}
                    </Badge>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(item.created_at)}
                    </div>
                  </div>

                  {item.original_word_context && (
                    <div className='text-sm text-muted-foreground'>
                      <span className='font-medium'>
                        {t('vocabulary.context.original')}:
                      </span>{' '}
                      {item.original_word_context}
                    </div>
                  )}

                  {item.translated_word_context && (
                    <div className='text-sm text-muted-foreground'>
                      <span className='font-medium'>
                        {t('vocabulary.context.translated')}:
                      </span>{' '}
                      {item.translated_word_context}
                    </div>
                  )}
                </div>

                <div className='relative'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => setEditingVocabulary(item)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 ml-1'
                    onClick={() => setDeletingVocabulary(item)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
