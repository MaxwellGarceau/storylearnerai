import { Button } from './Button';

interface FormActionsProps {
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
}: FormActionsProps) {
  return (
    <div className={`flex justify-end space-x-2 pt-4 p-6 ${className}`}>
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
