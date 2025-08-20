import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { Upload, FileText, X, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
  maxPages?: number;
  maxFileSize?: number; // in MB
}

const PDFUploadModal: React.FC<PDFUploadModalProps> = ({
  isOpen,
  onClose,
  onTextExtracted,
  maxPages = 10,
  maxFileSize = 5 // 5MB default
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    pages?: number;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
    });

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError(t('pdfUpload.errors.invalidFileType'));
      setSelectedFile(null);
      setFileInfo(null);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(t('pdfUpload.errors.fileTooLarge', { maxSize: maxFileSize }));
      setSelectedFile(null);
      setFileInfo(null);
      return;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      // Load the PDF document using pdfjs-dist
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Check page count
      if (pdf.numPages > maxPages) {
        setError(t('pdfUpload.errors.tooManyPages', { 
          actualPages: pdf.numPages, 
          maxPages 
        }));
        return;
      }

      // Update file info with page count
      setFileInfo(prev => prev ? { ...prev, pages: pdf.numPages } : null);

      // Extract text from all pages
      let extractedText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += pageText + '\n';
      }
      
      // Check if text was extracted
      if (!extractedText || extractedText.trim().length === 0) {
        setError(t('pdfUpload.errors.noTextFound'));
        return;
      }

      // Pass the extracted text to parent component
      onTextExtracted(extractedText.trim());
      onClose();
      
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(t('pdfUpload.errors.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('pdfUpload.title')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
              disabled={isProcessing}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-3">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={handleUploadClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
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
                  <div className="font-medium">{t('pdfUpload.uploadPrompt')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('pdfUpload.fileRequirements', { maxSize: maxFileSize, maxPages })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertIcon.destructive className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Requirements Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">{t('pdfUpload.requirements.title')}</div>
                <ul className="space-y-1 text-xs">
                  <li>• {t('pdfUpload.requirements.maxSize', { maxSize: maxFileSize })}</li>
                  <li>• {t('pdfUpload.requirements.maxPages', { maxPages })}</li>
                  <li>• {t('pdfUpload.requirements.pdfOnly')}</li>
                  <li>• {t('pdfUpload.requirements.textContent')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleProcessFile}
              disabled={!selectedFile || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div 
                    className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" 
                    role="status" 
                    aria-label="Loading"
                  />
                  <span>{t('pdfUpload.processing')}</span>
                </div>
              ) : (
                t('pdfUpload.extractText')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFUploadModal;
