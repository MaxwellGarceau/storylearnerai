import { Card, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { VocabularyWithLanguages } from '../../../types/database/vocabulary';
import type { DatabaseLanguage } from '../../../types/database';

interface VocabularyListItemProps {
  item: VocabularyWithLanguages;
  getLanguageName: (languageId: number) => string;
  onClick: (item: VocabularyWithLanguages) => void;
}

export function VocabularyListItem({
  item,
  getLanguageName,
  onClick,
}: VocabularyListItemProps) {
  return (
    <Card
      className='cursor-pointer hover:shadow-md transition-shadow'
      onClick={() => onClick(item)}
    >
      <CardContent className='p-3'>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1'>
              <span className='font-medium text-sm'>{item.from_word}</span>
              <span className='text-muted-foreground text-xs'>→</span>
              <span className='font-medium text-sm'>
                {item.target_word}
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
              {getLanguageName(item.target_language_id)}
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
  );
}

interface VocabularyListProps {
  items: VocabularyWithLanguages[];
  languages: DatabaseLanguage[];
  onItemClick: (item: VocabularyWithLanguages) => void;
}

export function VocabularyList({
  items,
  languages,
  onItemClick,
}: VocabularyListProps) {
  const getLanguageName = (languageId: number) => {
    const language = languages.find(lang => lang.id === languageId);
    return language?.name ?? 'Unknown';
  };

  return (
    <div className='space-y-2'>
      {items.map(item => (
        <VocabularyListItem
          key={item.id}
          item={item}
          getLanguageName={getLanguageName}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

export default VocabularyList;
