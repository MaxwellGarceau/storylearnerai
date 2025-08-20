import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { logger } from './logger';

// Lazy import to avoid issues in test environments
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

const getPdfJsLib = async (): Promise<typeof import('pdfjs-dist')> => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
  return pdfjsLib;
};

export interface PDFFileInfo {
  name: string;
  size: string;
  pages?: number;
}

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: PDFFileInfo;
}

export interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

export interface PDFTextItem {
  text: string;
  y: number;
  x: number;
  fontName: string;
  width: number;
  height: number;
  hasEOL: boolean;
}

// Type alias for methods that return PDF extraction results
type PDFExtractionPromise = Promise<PDFExtractionResult>;

export class PDFService {
  /**
   * Validates a PDF file for type, size, and basic structure
   */
  static validateFile(
    file: File, 
    maxFileSize = 5, 
    _maxPages = 10
  ): PDFValidationResult {
    // Validate file type
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'pdfUpload.errors.invalidFileType'
      };
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return {
        isValid: false,
        error: 'pdfUpload.errors.fileTooLarge',
        fileInfo: {
          name: file.name,
          size: this.formatFileSize(file.size)
        }
      };
    }

    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: this.formatFileSize(file.size)
      }
    };
  }

  /**
   * Extracts text content from a PDF file with intelligent filtering
   */
  static async extractText(
    file: File, 
    maxPages = 10
  ): PDFExtractionPromise {
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document using pdfjs-dist
      const pdfjs = await getPdfJsLib();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf: PDFDocumentProxy = await loadingTask.promise;
      
      // Check page count
      if (pdf.numPages > maxPages) {
        return {
          success: false,
          error: 'pdfUpload.errors.tooManyPages',
          pageCount: pdf.numPages
        };
      }

      // Extract text from all pages with filtering
      const pageTexts: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page: PDFPageProxy = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Get page dimensions for positioning analysis
        const viewport = page.getViewport({ scale: 1.0 });
        const pageHeight = viewport.height;
        
        // Filter and process text items with position information
        const filteredItems = textContent.items
          .filter((item): item is { str: string; dir: string; transform: number[]; width: number; height: number; fontName: string; hasEOL: boolean } => 'str' in item)
          .map((item) => ({
            text: item.str,
            y: item.transform[5], // Y position on page
            x: item.transform[4], // X position on page
            fontName: item.fontName,
            width: item.width,
            height: item.height,
            hasEOL: item.hasEOL
          }))
          .filter((item) => this.isStoryContent(item, pageHeight));
        
        // Reconstruct text with proper line breaks
        const pageText = this.reconstructTextWithLineBreaks(filteredItems);
        if (pageText.trim()) {
          pageTexts.push(pageText.trim());
        }
      }
      
      // Combine all page texts with single line breaks
      const extractedText = pageTexts.join('\n');
      
      // Check if text was extracted
      if (!extractedText || extractedText.trim().length === 0) {
        return {
          success: false,
          error: 'pdfUpload.errors.noTextFound',
          pageCount: pdf.numPages
        };
      }

      // Apply additional content filtering
      const filteredText = this.filterNonStoryContent(extractedText);

      return {
        success: true,
        text: filteredText.trim(),
        pageCount: pdf.numPages
      };
      
    } catch (err) {
      logger.error('translation', 'PDF processing error', { error: err, fileName: file.name });
      return {
        success: false,
        error: 'pdfUpload.errors.processingFailed'
      };
    }
  }

  /**
   * Determines if a text item is likely story content based on its position and properties
   */
  private static isStoryContent(
    item: PDFTextItem,
    pageHeight: number
  ): boolean {
    const text = item.text.trim();
    
    // Skip empty text
    if (!text) return false;
    
    // Calculate position as percentage of page height
    const yPercent = (item.y / pageHeight) * 100;
    
    // Filter out header content (top 10% of page)
    if (yPercent > 90) return false;
    
    // Filter out footer content (bottom 10% of page)
    if (yPercent < 10) return false;
    
    // Filter out page numbers (usually small, centered text)
    if (this.isPageNumber(text)) return false;
    
    // Filter out common header/footer patterns
    if (this.isHeaderFooter(text)) return false;
    
    // Filter out very small text (likely footnotes or captions)
    if (item.height < 8) return false;
    
    return true;
  }

  /**
   * Checks if text is likely a page number
   */
  private static isPageNumber(text: string): boolean {
    const cleanText = text.trim();
    
    // Simple numeric page numbers
    if (/^\d+$/.test(cleanText)) return true;
    
    // Page numbers with "Page" prefix
    if (/^Page\s+\d+$/i.test(cleanText)) return true;
    
    // Roman numerals (common in some documents)
    if (/^[IVXLC]+$/i.test(cleanText)) return true;
    
    return false;
  }

  /**
   * Checks if text is likely header or footer content
   */
  private static isHeaderFooter(text: string): boolean {
    const cleanText = text.trim().toLowerCase();
    
    // Common header/footer patterns
    const headerFooterPatterns = [
      /^copyright\s+\d{4}/i,
      /^all\s+rights\s+reserved/i,
      /^confidential/i,
      /^draft/i,
      /^version\s+\d+/i,
      /^rev\.?\s*\d+/i,
      /^page\s+\d+\s+of\s+\d+/i,
      /^\d+\s*\/\s*\d+$/,
      /^chapter\s+\d+/i,
      /^section\s+\d+/i,
      /^appendix\s+[a-z]/i,
      /^figure\s+\d+/i,
      /^table\s+\d+/i,
      /^footnote\s+\d+/i,
      /^endnote\s+\d+/i
    ];
    
    return headerFooterPatterns.some(pattern => pattern.test(cleanText));
  }

  /**
   * Reconstructs text with proper line breaks based on text positioning and EOL markers
   */
  private static reconstructTextWithLineBreaks(
    items: PDFTextItem[]
  ): string {
    if (items.length === 0) return '';
    
    // Sort items by Y position (top to bottom), then by X position (left to right)
    const sortedItems = [...items].sort((a, b) => {
      // First sort by Y position (with some tolerance for same line)
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff > 5) { // If Y difference is significant, sort by Y
        return b.y - a.y; // Higher Y values first (PDF coordinates are inverted)
      }
      // If Y positions are similar, sort by X position
      return a.x - b.x;
    });
    
    let result = '';
    let currentLine = '';
    let lastY = sortedItems[0].y;
    const lineTolerance = 5; // Tolerance for considering text on the same line
    const paragraphTolerance = 15; // Tolerance for detecting paragraph breaks
    
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const yDiff = Math.abs(item.y - lastY);
      
      // Check if this item is on a new line
      if (yDiff > lineTolerance && currentLine.trim()) {
        result += currentLine.trim() + '\n';
        currentLine = '';
        
        // Check if this is a paragraph break (larger gap)
        if (yDiff > paragraphTolerance) {
          result += '\n'; // Add extra line break for paragraph separation
        }
      }
      
      // Add text to current line
      currentLine += item.text;
      
      // Add space if not end of line and next item is close
      if (i < sortedItems.length - 1) {
        const nextItem = sortedItems[i + 1];
        const nextYDiff = Math.abs(nextItem.y - item.y);
        
        if (nextYDiff <= lineTolerance) {
          // Same line, add space if there's a gap
          const gap = nextItem.x - (item.x + item.width);
          if (gap > 5) { // If there's a significant gap, add a space
            currentLine += ' ';
          }
        }
      }
      
      lastY = item.y;
    }
    
    // Add the last line
    if (currentLine.trim()) {
      result += currentLine.trim();
    }
    
    return result;
  }

  /**
   * Applies additional content filtering to remove non-story elements
   */
  private static filterNonStoryContent(text: string): string {
    let filteredText = text;
    
    // Remove excessive whitespace but preserve line breaks
    filteredText = filteredText.replace(/[ \t]+/g, ' ').trim();
    
    // Remove common document artifacts
    const artifactsToRemove = [
      // Remove lines that are just punctuation or symbols
      /^[^\w\s]*$/gm,
      // Remove lines that are just numbers (likely page numbers)
      /^\d+$/gm,
      // Remove lines that are just single characters
      /^.$/gm,
      // Remove lines that are just repeated characters
      /^(.)\1+$/gm,
      // Remove lines that are just whitespace
      /^\s*$/gm
    ];
    
    artifactsToRemove.forEach(pattern => {
      filteredText = filteredText.replace(pattern, '');
    });
    
    // Normalize paragraph breaks (ensure exactly 2 line breaks between paragraphs)
    filteredText = filteredText.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    // Remove leading/trailing whitespace from each line
    filteredText = filteredText.split('\n').map(line => line.trim()).join('\n');
    
    // Remove empty lines at the beginning and end
    filteredText = filteredText.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');
    
    // Remove single line breaks that might be page boundaries (convert to paragraph breaks)
    // This helps clean up the transition between pages
    filteredText = filteredText.replace(/\n\s*\n/g, '\n\n');
    
    return filteredText;
  }

  /**
   * Validates and extracts text from a PDF file in one operation
   */
  static async processPDF(
    file: File, 
    maxFileSize = 5, 
    maxPages = 10
  ): Promise<PDFExtractionResult> {
    // First validate the file
    const validation = this.validateFile(file, maxFileSize, maxPages);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Then extract the text
    return this.extractText(file, maxPages);
  }

  /**
   * Formats file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Gets file info including page count without extracting text
   */
  static async getFileInfo(file: File): Promise<PDFFileInfo | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await getPdfJsLib();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf: PDFDocumentProxy = await loadingTask.promise;
      
      return {
        name: file.name,
        size: this.formatFileSize(file.size),
        pages: pdf.numPages
      };
    } catch (err) {
      logger.error('translation', 'Error getting PDF file info', { error: err, fileName: file.name });
      return null;
    }
  }
}
