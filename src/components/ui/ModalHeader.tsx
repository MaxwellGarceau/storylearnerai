import { Button } from './Button';
import { X, LucideIcon } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  icon?: LucideIcon;
}

export function ModalHeader({ title, onClose, icon: Icon }: ModalHeaderProps) {
  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={onClose}
        className='absolute top-[6px] right-[6px] h-8 w-8 p-0'
      >
        <X className='h-4 w-4' />
      </Button>
      <div className='py-6 pt-4 border-b'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          {Icon && <Icon className='h-5 w-5' />}
          {title}
        </h2>
      </div>
    </>
  );
}
