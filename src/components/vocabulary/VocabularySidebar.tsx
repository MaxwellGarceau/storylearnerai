import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLanguages } from '../../hooks/useLanguages';
import { useLocalization } from '../../hooks/useLocalization';
import { VocabularySaveModal } from './VocabularySaveModal';
import { VocabularyDetailModal } from './VocabularyDetailModal';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';

interface VocabularySidebarProps {
  className?: string;
  currentLanguageId?: number;
  currentFromLanguageId?: number;
}

export function VocabularySidebar({
  className,
  currentLanguageId,
  currentFromLanguageId,
}: VocabularySidebarProps) {
  const { t } = useLocalization();
  const { vocabulary, loading } = useVocabulary();
  const { languages } = useLanguages();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<
    number | null
  >(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] =
    useState<VocabularyWithLanguages | null>(null);

  // Filter vocabulary based on search term and language filters
  const filteredVocabulary = vocabulary.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.original_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translated_word.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage =
      !selectedLanguageFilter ||
      item.translated_language_id === selectedLanguageFilter;

    return matchesSearch && matchesLanguage;
  });

  const getLanguageName = (languageId: number) => {
    const language = languages.find(lang => lang.id === languageId);
    return language?.name || 'Unknown';
  };

  const handleSaveVocabulary = () => {
    setShowSaveModal(true);
  };

  const handleVocabularyClick = (vocabulary: VocabularyWithLanguages) => {
    setSelectedVocabulary(vocabulary);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5' />
          <h3 className='font-semibold'>{t('vocabulary.title')}</h3>
          <Badge variant='secondary' className='ml-2'>
            {filteredVocabulary.length}
          </Badge>
        </div>
        <Button
          size='sm'
          onClick={handleSaveVocabulary}
          className='h-8 w-8 p-0'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='space-y-2'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <input
            type='text'
            placeholder={t('vocabulary.search.placeholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          />
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='w-full justify-between'
        >
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            {t('vocabulary.filters.title')}
          </div>
          {showFilters ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>

        {showFilters && (
          <div className='space-y-2 p-3 border rounded-md bg-muted/50'>
            <label className='text-sm font-medium'>
              {t('vocabulary.filters.language')}
            </label>
            <select
              value={selectedLanguageFilter || ''}
              onChange={e =>
                setSelectedLanguageFilter(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className='w-full p-2 text-sm border rounded-md'
            >
              <option value=''>{t('vocabulary.filters.allLanguages')}</option>
              {languages.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vocabulary List */}
      <div className='h-[400px] overflow-y-auto'>
        {loading ? (
          <div className='flex items-center justify-center p-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
            <span className='ml-2 text-sm'>{t('loading')}</span>
          </div>
        ) : filteredVocabulary.length === 0 ? (
          <Card>
            <CardContent className='p-4 text-center'>
              <BookOpen className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>
                {searchTerm || selectedLanguageFilter
                  ? t('vocabulary.noResults')
                  : t('vocabulary.empty.sidebar')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-2'>
            {filteredVocabulary.map(item => (
              <Card
                key={item.id}
                className='cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => handleVocabularyClick(item)}
              >
                <CardContent className='p-3'>
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1'>
                        <span className='font-medium text-sm'>
                          {item.original_word}
                        </span>
                        <span className='text-muted-foreground text-xs'>→</span>
                        <span className='font-medium text-sm'>
                          {item.translated_word}
                        </span>
                      </div>
                      {item.part_of_speech && (
                        <Badge variant='outline' className='text-xs'>
                          {item.part_of_speech}
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>
                        {getLanguageName(item.from_language_id)} →{' '}
                        {getLanguageName(item.translated_language_id)}
                      </span>
                      {item.frequency_level && (
                        <Badge variant='secondary' className='text-xs'>
                          {item.frequency_level}
                        </Badge>
                      )}
                    </div>

                    {item.definition && (
                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {item.definition}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <VocabularySaveModal
          onClose={() => setShowSaveModal(false)}
          currentLanguageId={currentLanguageId}
          currentFromLanguageId={currentFromLanguageId}
        />
      )}

      {/* Detail Modal */}
      {selectedVocabulary && (
        <VocabularyDetailModal
          vocabulary={selectedVocabulary}
          _onClose={() => setSelectedVocabulary(null)}
        />
      )}
    </div>
  );
}
