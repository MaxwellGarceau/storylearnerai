// Lazy import to avoid issues in test environments
let pdfjsLib: any = null;

const getPdfJsLib = async () => {
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

export class PDFService {
  /**
   * Validates a PDF file for type, size, and basic structure
   */
  static validateFile(
    file: File, 
    maxFileSize: number = 5, 
    maxPages: number = 10
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
   * Extracts text content from a PDF file
   */
  static async extractText(
    file: File, 
    maxPages: number = 10
  ): Promise<PDFExtractionResult> {
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document using pdfjs-dist
      const pdfjs = await getPdfJsLib();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Check page count
      if (pdf.numPages > maxPages) {
        return {
          success: false,
          error: 'pdfUpload.errors.tooManyPages',
          pageCount: pdf.numPages
        };
      }

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
        return {
          success: false,
          error: 'pdfUpload.errors.noTextFound',
          pageCount: pdf.numPages
        };
      }

      return {
        success: true,
        text: extractedText.trim(),
        pageCount: pdf.numPages
      };
      
    } catch (err) {
      console.error('PDF processing error:', err);
      return {
        success: false,
        error: 'pdfUpload.errors.processingFailed'
      };
    }
  }

  /**
   * Validates and extracts text from a PDF file in one operation
   */
  static async processPDF(
    file: File, 
    maxFileSize: number = 5, 
    maxPages: number = 10
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
    return await this.extractText(file, maxPages);
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
      const pdf = await loadingTask.promise;
      
      return {
        name: file.name,
        size: this.formatFileSize(file.size),
        pages: pdf.numPages
      };
    } catch (err) {
      console.error('Error getting PDF file info:', err);
      return null;
    }
  }
}
