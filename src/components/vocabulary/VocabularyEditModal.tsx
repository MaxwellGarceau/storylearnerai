import VocabularyUpsertModal from './VocabularyUpsertModal';

import type { VocabularyWithLanguages } from '../../types/database/vocabulary';

interface VocabularyEditModalProps {
  vocabulary: VocabularyWithLanguages;
  onClose: () => void;
  onSaveSuccess?: () => void;
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
