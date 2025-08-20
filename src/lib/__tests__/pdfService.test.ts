import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFService } from '../pdfService';
import * as pdfjsLib from 'pdfjs-dist';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: {
    workerSrc: ''
  }
}));

// Helper function to create mock File objects with arrayBuffer method
const createMockFile = (content: string, name: string, type: string): File => {
  const file = new File([content], name, { type });
  // Mock the arrayBuffer method
  file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};

describe('PDFService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateFile', () => {
    it('should validate a valid PDF file', () => {
      const validFile = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = PDFService.validateFile(validFile, 5, 10);
      
      expect(result.isValid).toBe(true);
      expect(result.fileInfo).toEqual({
        name: 'test.pdf',
        size: '12 Bytes'
      });
    });

    it('should reject non-PDF files', () => {
      const invalidFile = createMockFile('test content', 'test.txt', 'text/plain');
      const result = PDFService.validateFile(invalidFile, 5, 10);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.invalidFileType');
    });

    it('should reject files that are too large', () => {
      // Create a file that's larger than 5MB
      const largeFile = createMockFile('x'.repeat(6 * 1024 * 1024), 'large.pdf', 'application/pdf');
      const result = PDFService.validateFile(largeFile, 5, 10);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.fileTooLarge');
      expect(result.fileInfo).toEqual({
        name: 'large.pdf',
        size: '6 MB'
      });
    });

    it('should use custom max file size', () => {
      const file = createMockFile('x'.repeat(2 * 1024 * 1024), 'test.pdf', 'application/pdf');
      const result = PDFService.validateFile(file, 1, 10); // 1MB limit
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.fileTooLarge');
    });
  });

  describe('extractText', () => {
    it('should extract text from a valid PDF', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ 
            str: 'Extracted text content',
            dir: 'ltr',
            transform: [1, 0, 0, 1, 50, 400], // X=50, Y=400 (middle of page)
            width: 100,
            height: 12,
            fontName: 'Arial',
            hasEOL: false
          }]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf)
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Extracted text content\n\nExtracted text content');
      expect(result.pageCount).toBe(2);
    });

    it('should reject PDFs with too many pages', async () => {
      const mockPdf = {
        numPages: 15
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf)
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.tooManyPages');
      expect(result.pageCount).toBe(15);
    });

    it('should handle PDFs with no text content', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: []
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf)
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.noTextFound');
      expect(result.pageCount).toBe(1);
    });

    it('should handle PDF processing errors', async () => {
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.reject(new Error('PDF processing failed'))
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.processingFailed');
    });
  });

  describe('processPDF', () => {
    it('should validate and extract text in one operation', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ 
            str: 'Extracted text content',
            dir: 'ltr',
            transform: [1, 0, 0, 1, 50, 400], // X=50, Y=400 (middle of page)
            width: 100,
            height: 12,
            fontName: 'Arial',
            hasEOL: false
          }]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf)
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.processPDF(file, 5, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Extracted text content');
      expect(result.pageCount).toBe(1);
    });

    it('should fail validation before attempting extraction', async () => {
      const invalidFile = createMockFile('test content', 'test.txt', 'text/plain');
      const result = await PDFService.processPDF(invalidFile, 5, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.invalidFileType');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(PDFService.formatFileSize(0)).toBe('0 Bytes');
      expect(PDFService.formatFileSize(1024)).toBe('1 KB');
      expect(PDFService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(PDFService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal sizes', () => {
      expect(PDFService.formatFileSize(1536)).toBe('1.5 KB');
      expect(PDFService.formatFileSize(1536 * 1024)).toBe('1.5 MB');
    });
  });

  describe('getFileInfo', () => {
    it('should get file info including page count', async () => {
      const mockPdf = {
        numPages: 5
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve(mockPdf)
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.getFileInfo(file);
      
      expect(result).toEqual({
        name: 'test.pdf',
        size: '12 Bytes',
        pages: 5
      });
    });

    it('should return null on error', async () => {
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.reject(new Error('Failed to load PDF'))
      });

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.getFileInfo(file);
      
      expect(result).toBeNull();
    });
  });
});
