import VocabularyUpsertModal from './VocabularyUpsertModal';

interface VocabularySaveModalProps {
  onClose: () => void;
  currentLanguageId?: number;
  currentFromLanguageId?: number;
  initialData?: {
    originalWord?: string;
    translatedWord?: string;
    originalContext?: string;
    translatedContext?: string;
  };
  onSaveSuccess?: () => void;
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
