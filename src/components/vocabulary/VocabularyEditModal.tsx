import VocabularyUpsertModal from './VocabularyUpsertModal';

import type { VocabularyWithLanguages } from '../../types/database/vocabulary';
import type { VoidFunction } from '../../types/common';

interface VocabularyEditModalProps {
  vocabulary: VocabularyWithLanguages;
  onClose: VoidFunction;
  onSaveSuccess?: VoidFunction;
}

export function VocabularyEditModal({
  vocabulary,
  onClose,
  onSaveSuccess,
}: VocabularyEditModalProps) {
  return (
    <VocabularyUpsertModal
      mode='edit'
      vocabulary={vocabulary}
      onClose={onClose}
      onSaveSuccess={onSaveSuccess}
    />
  );
}

export default VocabularyEditModal;
