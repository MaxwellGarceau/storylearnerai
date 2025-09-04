import { BookOpen, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useLocalization } from '../../../hooks/useLocalization';

interface VocabularySidebarHeaderProps {
  count: number;
  onAdd: () => void;
  className?: string;
  showAddButton?: boolean;
}

export function VocabularySidebarHeader({
  count,
  onAdd,
  className,
  showAddButton = true,
}: VocabularySidebarHeaderProps) {
  const { t } = useLocalization();

  return (
    <div className={`flex items-center justify-between ${className ?? ''}`}>
      <div className='flex items-center gap-2'>
        <BookOpen className='h-5 w-5' />
        <h3 className='font-semibold'>{t('vocabulary.title')}</h3>
        {showAddButton && (
          <Badge variant='secondary' className='ml-2'>
            {count}
          </Badge>
        )}
      </div>
      {showAddButton && (
        <Button size='sm' onClick={onAdd} className='h-8 w-8 p-0'>
          <Plus className='h-4 w-4' />
        </Button>
      )}
    </div>
  );
}

export default VocabularySidebarHeader;
