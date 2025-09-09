import VocabularyUpsertModal from './VocabularyUpsertModal';
import type { VoidFunction } from '../../../types/common';

interface VocabularySaveModalProps {
  onClose: VoidFunction;
  currentLanguageId?: number;
  currentFromLanguageId?: number;
  initialData?: {
    fromWord?: string;
    targetWord?: string;
    fromContext?: string;
    targetContext?: string;
  };
  onSaveSuccess?: VoidFunction;
}

export function VocabularySaveModal({
  onClose,
  currentLanguageId,
  currentFromLanguageId,
  initialData,
  onSaveSuccess,
}: VocabularySaveModalProps) {
  return (
    <VocabularyUpsertModal
      mode='create'
      onClose={onClose}
      onSaveSuccess={onSaveSuccess}
      currentLanguageId={currentLanguageId}
      currentFromLanguageId={currentFromLanguageId}
      initialData={initialData}
    />
  );
}

export default VocabularySaveModal;
