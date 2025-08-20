import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Check } from 'lucide-react';

interface FileInfo {
  name: string;
  size: string;
  pages?: number;
}

interface FileUploadAreaProps {
  accept?: string;
  maxFileSize?: number;
  maxPages?: number;
  onFileSelect: (file: File) => void;
  onValidationError: (error: string) => void;
  isProcessing?: boolean;
  selectedFile?: File | null;
  fileInfo?: FileInfo | null;
  uploadPrompt?: string;
  fileRequirements?: string;
  className?: string;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
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
  className = ''
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const defaultFileRequirements = fileRequirements ?? t('pdfUpload.fileRequirements', { maxSize: maxFileSize, maxPages });

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          selectedFile 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
          data-testid="pdf-file-input"
        />
        
        {selectedFile ? (
          <div className="space-y-2">
            <Check className="w-8 h-8 text-green-600 mx-auto" />
            <div className="font-medium text-green-800">{fileInfo?.name}</div>
            <div className="text-sm text-green-600">
              {fileInfo?.size}
              {fileInfo?.pages && ` • ${fileInfo.pages} pages`}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="font-medium">{defaultUploadPrompt}</div>
            <div className="text-sm text-muted-foreground">
              {defaultFileRequirements}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
