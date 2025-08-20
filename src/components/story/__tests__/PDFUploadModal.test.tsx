import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PDFUploadModal from '../PDFUploadModal';
import { PDFService } from '../../../lib/pdfService';

// Mock PDFService
vi.mock('../../../lib/pdfService', () => ({
  PDFService: {
    validateFile: vi.fn(),
    processPDF: vi.fn(),
    formatFileSize: vi.fn()
  }
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'pdfUpload.title': 'Upload PDF',
        'pdfUpload.uploadPrompt': 'Click to select a PDF file',
        'pdfUpload.fileRequirements': `Max ${params?.maxSize ?? 5}MB, ${params?.maxPages ?? 10} pages`,
        'pdfUpload.extractText': 'Extract Text',
        'pdfUpload.processing': 'Processing PDF...',
        'pdfUpload.requirements.title': 'File Requirements',
        'pdfUpload.requirements.maxSize': `Maximum file size: ${params?.maxSize ?? 5}MB`,
        'pdfUpload.requirements.maxPages': `Maximum pages: ${params?.maxPages ?? 10}`,
        'pdfUpload.requirements.pdfOnly': 'PDF files only',
        'pdfUpload.requirements.textContent': 'Must contain extractable text',
        'pdfUpload.errors.invalidFileType': 'Please select a valid PDF file',
        'pdfUpload.errors.fileTooLarge': `File size exceeds ${params?.maxSize ?? 5}MB limit`,
        'pdfUpload.errors.tooManyPages': `PDF has ${params?.actualPages ?? 0} pages, maximum allowed is ${params?.maxPages ?? 10}`,
        'pdfUpload.errors.noTextFound': 'No text content found in the PDF',
        'pdfUpload.errors.processingFailed': 'Failed to process PDF. Please try again.',
        'pdfUpload.bestPractices.title': 'Best Practices for Best Results',
        'pdfUpload.bestPractices.extractableText': 'Use PDFs with selectable text (not scanned images)',
        'pdfUpload.bestPractices.storyContent': 'Upload PDFs that contain primarily story content',
        'pdfUpload.bestPractices.avoidImages': 'Avoid PDFs that are mostly images or scanned documents',
        'pdfUpload.bestPractices.cleanFormat': 'Clean, well-formatted text works best for translation',
        'pdfUpload.cleanupNotice.title': 'Important: Text Cleanup May Be Required',
        'pdfUpload.cleanupNotice.description': 'Our system tries to identify story content, but PDFs can contain various text elements. You may need to review and clean up the extracted text to remove any unrelated content, headers, footnotes, or other non-story elements.',
        'common.cancel': 'Cancel'
      };
      return translations[key] || key;
    }
  })
}));

describe('PDFUploadModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onTextExtracted: vi.fn(),
    maxPages: 10,
    maxFileSize: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders when isOpen is true', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    expect(screen.getByText('Upload PDF')).toBeInTheDocument();
    expect(screen.getByText('Click to select a PDF file')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PDFUploadModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Upload PDF')).not.toBeInTheDocument();
  });

  it('shows file requirements info', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    expect(screen.getByText('File Requirements')).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 5MB/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum pages: 10/)).toBeInTheDocument();
    expect(screen.getByText(/PDF files only/)).toBeInTheDocument();
    expect(screen.getByText(/Must contain extractable text/)).toBeInTheDocument();
  });

  it('shows best practices guide', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    expect(screen.getByText('Best Practices for Best Results')).toBeInTheDocument();
    expect(screen.getByText(/Use PDFs with selectable text/)).toBeInTheDocument();
    expect(screen.getByText(/Upload PDFs that contain primarily story content/)).toBeInTheDocument();
    expect(screen.getByText(/Avoid PDFs that are mostly images/)).toBeInTheDocument();
    expect(screen.getByText(/Clean, well-formatted text works best/)).toBeInTheDocument();
  });

  it('shows cleanup notice', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    expect(screen.getByText('Important: Text Cleanup May Be Required')).toBeInTheDocument();
    expect(screen.getByText(/Our system tries to identify story content/)).toBeInTheDocument();
    expect(screen.getByText(/You may need to review and clean up/)).toBeInTheDocument();
  });

  it('opens file dialog when upload area is clicked', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    const uploadArea = screen.getByText('Click to select a PDF file').closest('div');
    expect(uploadArea).toBeInTheDocument();
    
    if (uploadArea) {
      fireEvent.click(uploadArea);
      // Note: We can't actually test file dialog opening in unit tests
      // but we can verify the click handler is attached
    }
  });

  it('calls onClose when close button is clicked', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error for invalid file type', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: false,
      error: 'pdfUpload.errors.invalidFileType'
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('Please select a valid PDF file')).toBeInTheDocument();
    });
  });

  it('shows error for file too large', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: false,
      error: 'pdfUpload.errors.fileTooLarge'
    });

    render(<PDFUploadModal {...defaultProps} maxFileSize={1} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('File size exceeds 1MB limit')).toBeInTheDocument();
    });
  });

  it('disables extract button when no file is selected', () => {
    render(<PDFUploadModal {...defaultProps} />);
    
    const extractButton = screen.getByText('Extract Text');
    expect(extractButton).toBeDisabled();
  });

  it('enables extract button when valid file is selected', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      expect(extractButton).not.toBeDisabled();
    });
  });

  it('shows file info when valid file is selected', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('12 Bytes')).toBeInTheDocument();
    });
  });

  it('processes PDF and extracts text successfully', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    vi.mocked(PDFService.processPDF).mockResolvedValue({
      success: true,
      text: 'Extracted text content',
      pageCount: 2
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      fireEvent.click(extractButton);
    });
    
    await waitFor(() => {
      expect(defaultProps.onTextExtracted).toHaveBeenCalledWith('Extracted text content');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows error when PDF has too many pages', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    vi.mocked(PDFService.processPDF).mockResolvedValue({
      success: false,
      error: 'pdfUpload.errors.tooManyPages',
      pageCount: 15
    });

    render(<PDFUploadModal {...defaultProps} maxPages={10} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      fireEvent.click(extractButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('PDF has 15 pages, maximum allowed is 10')).toBeInTheDocument();
    });
  });

  it('shows error when no text is found in PDF', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    vi.mocked(PDFService.processPDF).mockResolvedValue({
      success: false,
      error: 'pdfUpload.errors.noTextFound',
      pageCount: 1
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      fireEvent.click(extractButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No text content found in the PDF')).toBeInTheDocument();
    });
  });

  it('shows error when PDF processing fails', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    vi.mocked(PDFService.processPDF).mockResolvedValue({
      success: false,
      error: 'pdfUpload.errors.processingFailed'
    });

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      fireEvent.click(extractButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to process PDF. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows processing state during PDF extraction', async () => {
    vi.mocked(PDFService.validateFile).mockReturnValue({
      isValid: true,
      fileInfo: {
        name: 'test.pdf',
        size: '12 Bytes'
      }
    });

    vi.mocked(PDFService.processPDF).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        text: 'Extracted text content',
        pageCount: 1
      }), 100))
    );

    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      const extractButton = screen.getByText('Extract Text');
      fireEvent.click(extractButton);
    });
    
    // Should show processing state
    expect(screen.getByText('Processing PDF...')).toBeInTheDocument();
    
    // Should disable close button during processing
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toBeDisabled();
  });
});
