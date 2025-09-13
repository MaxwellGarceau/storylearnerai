import { useState } from 'react';
import { useVocabulary } from '../../../hooks/useVocabulary';
import { useLanguages } from '../../../hooks/useLanguages';
import { useLanguageFilter } from '../../../hooks/useLanguageFilter';
import { useLocalization } from '../../../hooks/useLocalization';
import { useAuth } from '../../../hooks/useAuth';
import { AuthPrompt } from '../../ui/AuthPrompt';
import { VocabularySaveModal } from '../modals/VocabularySaveModal';
import { VocabularyDetailModal } from '../modals/VocabularyDetailModal';
import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';
import { VocabularySidebarHeader } from './VocabularySidebarHeader';
import { VocabularySearchInput } from './VocabularySearchInput';
// Removed local language filter; global Story Sidebar filter controls language
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
  const { languages, getLanguageIdByCode } = useLanguages();
  const { user } = useAuth();
  const { targetLanguage } = useLanguageFilter();

  const [searchTerm, setSearchTerm] = useState('');
  // Local language filter removed; filtering is controlled by the Story Sidebar's global filter
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] =
    useState<VocabularyWithLanguages | null>(null);

  // Filter vocabulary based on search term and language filters
  const effectiveTargetLanguageId =
    currentLanguageId ??
    (targetLanguage ? getLanguageIdByCode(targetLanguage) : undefined);

  const filteredVocabulary = vocabulary.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.from_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.target_word.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = (() => {
      if (effectiveTargetLanguageId) {
        return item.target_language_id === effectiveTargetLanguageId;
      }
      return true;
    })();

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
        showAddButton={Boolean(user)}
      />

      {/* Search - Only show when user is logged in */}
      {user && (
        <div className='space-y-2'>
          <VocabularySearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
      )}

      {/* Vocabulary List */}
      <div className='h-[400px] overflow-y-auto'>
        {!user ? (
          <AuthPrompt t={t} variant='button' />
        ) : loading ? (
          <div className='flex items-center justify-center p-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
            <span className='ml-2 text-sm'>{t('loading')}</span>
          </div>
        ) : filteredVocabulary.length === 0 ? (
          <VocabularyEmptyState showNoResults={Boolean(searchTerm)} />
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
