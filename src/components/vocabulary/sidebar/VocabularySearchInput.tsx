import { Search } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';

interface VocabularySearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function VocabularySearchInput({
  value,
  onChange,
}: VocabularySearchInputProps) {
  const { t } = useLocalization();

  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
      <input
        type='text'
        placeholder={t('vocabulary.search.placeholder')}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='w-full pl-10 pr-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      />
    </div>
  );
}

export default VocabularySearchInput;
