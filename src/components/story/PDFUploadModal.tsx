import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription, AlertIcon } from '../ui/Alert';
import { Upload, FileText, X, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFService, PDFFileInfo } from '../../lib/pdfService';

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
  const [fileInfo, setFileInfo] = useState<PDFFileInfo | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: PDFService.formatFileSize(file.size),
    });

    // Validate file using PDF service
    const validation = PDFService.validateFile(file, maxFileSize, maxPages);
    if (!validation.isValid) {
      // Handle specific error messages that need parameters
      if (validation.error === 'pdfUpload.errors.fileTooLarge') {
        setError(t(validation.error, { maxSize: maxFileSize }));
      } else if (validation.error) {
        setError(t(validation.error));
      }
      setSelectedFile(null);
      setFileInfo(null);
      return;
    }

    // Update file info with validated data
    if (validation.fileInfo) {
      setFileInfo(validation.fileInfo);
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
      // Process PDF using PDF service
      const result = await PDFService.processPDF(selectedFile, maxFileSize, maxPages);
      
      if (!result.success) {
        // Handle specific error messages that need parameters
        if (result.error === 'pdfUpload.errors.tooManyPages' && result.pageCount) {
          setError(t(result.error, { actualPages: result.pageCount, maxPages }));
        } else if (result.error === 'pdfUpload.errors.fileTooLarge') {
          setError(t(result.error, { maxSize: maxFileSize }));
        } else if (result.error) {
          setError(t(result.error));
        }
        if (result.pageCount) {
          setFileInfo(prev => prev ? { ...prev, pages: result.pageCount } : null);
        }
        return;
      }

      // Update file info with page count
      setFileInfo(prev => prev ? { ...prev, pages: result.pageCount } : null);

      // Pass the extracted text to parent component
      if (result.text) {
        onTextExtracted(result.text);
      }
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

          {/* Best Practices Guide */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-green-800">
                <div className="font-medium mb-1">{t('pdfUpload.bestPractices.title')}</div>
                <ul className="space-y-1 text-xs">
                  <li>• {t('pdfUpload.bestPractices.extractableText')}</li>
                  <li>• {t('pdfUpload.bestPractices.storyContent')}</li>
                  <li>• {t('pdfUpload.bestPractices.avoidImages')}</li>
                  <li>• {t('pdfUpload.bestPractices.cleanFormat')}</li>
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
              onClick={() => {
                void handleProcessFile();
              }}
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
