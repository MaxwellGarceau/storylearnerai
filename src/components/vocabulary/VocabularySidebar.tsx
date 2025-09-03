import { useState } from 'react';
// Removed unused Card imports after refactor
import { useVocabulary } from '../../hooks/useVocabulary';
import { useLanguages } from '../../hooks/useLanguages';
import { useLocalization } from '../../hooks/useLocalization';
import { VocabularySaveModal } from './VocabularySaveModal';
import { VocabularyDetailModal } from './VocabularyDetailModal';
import type { VocabularyWithLanguages } from '../../types/database/vocabulary';
import { VocabularySidebarHeader } from './VocabularySidebarHeader';
import { VocabularySearchInput } from './VocabularySearchInput';
import { VocabularyLanguageFilter } from './VocabularyLanguageFilter';
import { VocabularyEmptyState } from './VocabularyEmptyState';
import { VocabularyList } from './VocabularyList';

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

  const handleSaveVocabulary = () => {
    setShowSaveModal(true);
  };

  const handleVocabularyClick = (vocabulary: VocabularyWithLanguages) => {
    setSelectedVocabulary(vocabulary);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <VocabularySidebarHeader
        count={filteredVocabulary.length}
        onAdd={handleSaveVocabulary}
      />

      {/* Search and Filters */}
      <div className='space-y-2'>
        <VocabularySearchInput value={searchTerm} onChange={setSearchTerm} />
        <VocabularyLanguageFilter
          show={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          selectedLanguageId={selectedLanguageFilter}
          onChange={setSelectedLanguageFilter}
          languages={languages}
        />
      </div>

      {/* Vocabulary List */}
      <div className='h-[400px] overflow-y-auto'>
        {loading ? (
          <div className='flex items-center justify-center p-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
            <span className='ml-2 text-sm'>{t('loading')}</span>
          </div>
        ) : filteredVocabulary.length === 0 ? (
          <VocabularyEmptyState showNoResults={Boolean(searchTerm || selectedLanguageFilter)} />
        ) : (
          <VocabularyList
            items={filteredVocabulary}
            languages={languages}
            onItemClick={handleVocabularyClick}
          />
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
