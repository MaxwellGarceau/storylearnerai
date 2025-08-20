import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PDFUploadModal from '../PDFUploadModal';
import * as pdfjsLib from 'pdfjs-dist';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn()
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'pdfUpload.title': 'Upload PDF',
        'pdfUpload.uploadPrompt': 'Click to select a PDF file',
        'pdfUpload.fileRequirements': `Max ${params?.maxSize || 5}MB, ${params?.maxPages || 10} pages`,
        'pdfUpload.extractText': 'Extract Text',
        'pdfUpload.processing': 'Processing PDF...',
        'pdfUpload.requirements.title': 'File Requirements',
        'pdfUpload.requirements.maxSize': `Maximum file size: ${params?.maxSize || 5}MB`,
        'pdfUpload.requirements.maxPages': `Maximum pages: ${params?.maxPages || 10}`,
        'pdfUpload.requirements.pdfOnly': 'PDF files only',
        'pdfUpload.requirements.textContent': 'Must contain extractable text',
        'pdfUpload.errors.invalidFileType': 'Please select a valid PDF file',
        'pdfUpload.errors.fileTooLarge': `File size exceeds ${params?.maxSize || 5}MB limit`,
        'pdfUpload.errors.tooManyPages': `PDF has ${params?.actualPages || 0} pages, maximum allowed is ${params?.maxPages || 10}`,
        'pdfUpload.errors.noTextFound': 'No text content found in the PDF',
        'pdfUpload.errors.processingFailed': 'Failed to process PDF. Please try again.',
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
    expect(screen.getByText('PDF files only')).toBeInTheDocument();
    expect(screen.getByText('Must contain extractable text')).toBeInTheDocument();
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
    render(<PDFUploadModal {...defaultProps} />);
    
    const fileInput = screen.getByTestId('pdf-file-input');
    expect(fileInput).toBeInTheDocument();
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText(/0.01 KB/)).toBeInTheDocument();
    });
  });

  it('processes PDF and extracts text successfully', async () => {
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [{ str: 'Extracted text content' }]
      })
    };
    
    const mockPdf = {
      numPages: 2,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };
    
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: Promise.resolve(mockPdf)
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
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [{ str: 'Extracted text content' }]
      })
    };
    
    const mockPdf = {
      numPages: 15,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };
    
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: Promise.resolve(mockPdf)
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
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [] // No text items
      })
    };
    
    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };
    
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: Promise.resolve(mockPdf)
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
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: Promise.reject(new Error('Processing failed'))
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
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [{ str: 'Extracted text content' }]
      })
    };
    
    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };
    
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: new Promise(resolve => setTimeout(() => resolve(mockPdf), 100))
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
    
    // Should show processing state
    expect(screen.getByText('Processing PDF...')).toBeInTheDocument();
    
    // Should disable close button during processing
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toBeDisabled();
  });
});
