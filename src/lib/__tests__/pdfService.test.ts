import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFService } from '../pdfService';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Reusable type alias for the loading task returned by getDocument
type PDFLoadingTask = ReturnType<typeof pdfjsLib.getDocument>;

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({ items: [] }),
        getViewport: vi.fn().mockReturnValue({ height: 800 })
      })
    } as unknown as PDFDocumentProxy)
  }),
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

// Helpers to create properly typed loading tasks for pdfjs getDocument
const createResolvedLoadingTask = (
  doc: Partial<PDFDocumentProxy>
): PDFLoadingTask => {
  return {
    promise: Promise.resolve(doc as PDFDocumentProxy)
  } as unknown as PDFLoadingTask;
};

const createRejectedLoadingTask = (
  reason: unknown
): PDFLoadingTask => {
  return {
    promise: Promise.reject(
      reason instanceof Error ? reason : new Error(String(reason))
    )
  } as unknown as PDFLoadingTask;
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
          items: [
            { 
              str: 'First paragraph text',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // X=50, Y=400
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Second paragraph text',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 350], // X=50, Y=350 (paragraph break)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('First paragraph text\n\nSecond paragraph text\nFirst paragraph text\n\nSecond paragraph text');
      expect(result.pageCount).toBe(2);
    });

    it('should filter out header content (top 10% of page)', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Document Title', // Header at top of page
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 750], // Y=750 (top 10% of 800px page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Story content here',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // Y=400 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Story content here');
      expect(result.text).not.toContain('Document Title');
    });

    it('should filter out footer content (bottom 10% of page)', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Story content here',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // Y=400 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Page 1 of 5', // Footer at bottom of page
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 50], // Y=50 (bottom 10% of 800px page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Story content here');
      expect(result.text).not.toContain('Page 1 of 5');
    });

    it('should filter out page numbers', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Story content here',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // Y=400 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: '1', // Page number
              dir: 'ltr',
              transform: [1, 0, 0, 1, 400, 400], // X=400, Y=400 (middle of page)
              width: 10,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Page 2', // Page number with prefix
              dir: 'ltr',
              transform: [1, 0, 0, 1, 350, 400], // X=350, Y=400 (middle of page)
              width: 50,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Story content here');
      expect(result.text).not.toContain('1');
      expect(result.text).not.toContain('Page 2');
    });

    it('should filter out header/footer patterns', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Story content here',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // Y=400 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Copyright 2024',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 300], // Y=300 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Chapter 1',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 200], // Y=200 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Figure 1.1',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 100], // Y=100 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Story content here');
      expect(result.text).not.toContain('Copyright 2024');
      expect(result.text).not.toContain('Chapter 1');
      expect(result.text).not.toContain('Figure 1.1');
    });

    it('should filter out very small text (likely footnotes)', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Story content here',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 400], // Y=400 (middle of page)
              width: 100,
              height: 12, // Normal height
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Footnote text',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 300], // Y=300 (middle of page)
              width: 100,
              height: 6, // Small height (less than 8px)
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toBe('Story content here');
      expect(result.text).not.toContain('Footnote text');
    });

    it('should preserve story content while filtering non-story elements', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { 
              str: 'Once upon a time',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 500], // Y=500 (middle of page)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'there was a little girl',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 480], // Y=480 (same line)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'who lived in a village',
              dir: 'ltr',
              transform: [1, 0, 0, 1, 50, 450], // Y=450 (new line)
              width: 100,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            },
            { 
              str: 'Page 1', // Page number to be filtered
              dir: 'ltr',
              transform: [1, 0, 0, 1, 400, 400], // X=400, Y=400
              width: 50,
              height: 12,
              fontName: 'Arial',
              hasEOL: false
            }
          ]
        }),
        getViewport: vi.fn().mockReturnValue({
          height: 800
        })
      };
      
      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(true);
      expect(result.text).toContain('Once upon a time');
      expect(result.text).toContain('there was a little girl');
      expect(result.text).toContain('who lived in a village');
      expect(result.text).not.toContain('Page 1');
    });

    it('should reject PDFs with too many pages', async () => {
      const mockPdf = {
        numPages: 15
      };
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

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
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.extractText(file, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('pdfUpload.errors.noTextFound');
      expect(result.pageCount).toBe(1);
    });

    it('should handle PDF processing errors', async () => {
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createRejectedLoadingTask(new Error('PDF processing failed'))
      );

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
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

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
      
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createResolvedLoadingTask(mockPdf)
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.getFileInfo(file);
      
      expect(result).toEqual({
        name: 'test.pdf',
        size: '12 Bytes',
        pages: 5
      });
    });

    it('should return null on error', async () => {
      vi.mocked(pdfjsLib.getDocument).mockReturnValue(
        createRejectedLoadingTask(new Error('Failed to load PDF'))
      );

      const file = createMockFile('test content', 'test.pdf', 'application/pdf');
      const result = await PDFService.getFileInfo(file);
      
      expect(result).toBeNull();
    });
  });
});
