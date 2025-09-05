import { Button } from '../Button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formActionsVariants = cva('flex justify-end space-x-2 pt-4 p-6', {
  variants: {
    align: {
      end: 'justify-end',
      start: 'justify-start',
      center: 'justify-center',
      between: 'justify-between',
    },
    padded: {
      true: 'pt-4 p-6',
      false: 'pt-2 p-0',
    },
  },
  defaultVariants: {
    align: 'end',
    padded: true,
  },
});

interface FormActionsProps extends VariantProps<typeof formActionsVariants> {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
  className = '',
  align,
  padded,
}: FormActionsProps) {
  return (
    <div className={cn(formActionsVariants({ align, padded }), className)}>
      <Button
        type='button'
        variant='outline'
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
