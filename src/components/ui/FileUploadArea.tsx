import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { Upload, Check } from 'lucide-react';

export interface FileInfo {
  name: string;
  size: string;
  pages?: number;
}

const fileUploadAreaVariants = cva(
  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
  {
    variants: {
      state: {
        default: 'border-gray-300 hover:border-gray-400',
        selected: 'border-green-300 bg-green-50',
        processing: 'border-gray-300 cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

const iconVariants = cva('w-8 h-8 mx-auto', {
  variants: {
    state: {
      default: 'text-gray-400',
      selected: 'text-green-600',
      processing: 'text-gray-400',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const textVariants = cva('font-medium', {
  variants: {
    state: {
      default: 'text-gray-900',
      selected: 'text-green-800',
      processing: 'text-gray-500',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const subtitleVariants = cva('text-sm', {
  variants: {
    state: {
      default: 'text-muted-foreground',
      selected: 'text-green-600',
      processing: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export interface FileUploadAreaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fileUploadAreaVariants> {
  accept?: string;
  maxFileSize?: number;
  maxPages?: number;
  onFileSelect: (file: File) => void;
  onValidationError?: (error: string) => void;
  isProcessing?: boolean;
  selectedFile?: File | null;
  fileInfo?: FileInfo | null;
  uploadPrompt?: string;
  fileRequirements?: string;
  'data-testid'?: string;
}

const FileUploadArea = React.forwardRef<HTMLDivElement, FileUploadAreaProps>(
  (
    {
      className,
      state: _state,
      accept = '.pdf',
      maxFileSize = 5,
      maxPages = 10,
      onFileSelect,
      onValidationError: _onValidationError,
      isProcessing = false,
      selectedFile,
      fileInfo,
      uploadPrompt,
      fileRequirements,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Determine the current state
    const currentState = isProcessing
      ? 'processing'
      : selectedFile
        ? 'selected'
        : 'default';

    const handleUploadClick = () => {
      if (!isProcessing) {
        fileInputRef.current?.click();
      }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      onFileSelect(file);
    };

    const defaultUploadPrompt = uploadPrompt ?? t('pdfUpload.uploadPrompt');
    const defaultFileRequirements =
      fileRequirements ??
      t('pdfUpload.fileRequirements', { maxSize: maxFileSize, maxPages });

    return (
      <div className={cn('space-y-3', className)} ref={ref} {...props}>
        <div
          className={cn(fileUploadAreaVariants({ state: currentState }))}
          onClick={handleUploadClick}
          role='button'
          tabIndex={isProcessing ? -1 : 0}
          aria-label={
            selectedFile ? 'Change selected file' : 'Select file to upload'
          }
          aria-disabled={isProcessing}
          data-testid={
            props['data-testid']
              ? `${props['data-testid']}-area`
              : 'upload-area'
          }
        >
          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            onChange={handleFileSelect}
            className='hidden'
            disabled={isProcessing}
            data-testid='pdf-file-input'
            aria-hidden='true'
          />
          {selectedFile ? (
            <div className='space-y-2'>
              <Check className={cn(iconVariants({ state: currentState }))} />
              <div className={cn(textVariants({ state: currentState }))}>
                {fileInfo?.name}
              </div>
              <div className={cn(subtitleVariants({ state: currentState }))}>
                {fileInfo?.size}
                {fileInfo?.pages && ` • ${fileInfo.pages} pages`}
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              <Upload className={cn(iconVariants({ state: currentState }))} />
              <div className={cn(textVariants({ state: currentState }))}>
                {defaultUploadPrompt}
              </div>
              <div className={cn(subtitleVariants({ state: currentState }))}>
                {defaultFileRequirements}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileUploadArea.displayName = 'FileUploadArea';

export { FileUploadArea };
