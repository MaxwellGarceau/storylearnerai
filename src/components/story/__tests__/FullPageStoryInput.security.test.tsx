import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import FullPageStoryInput from '../FullPageStoryInput';
import type { LanguageCode, DifficultyLevel } from '../../../lib/types/prompt';

// Mock the sanitization utilities
vi.mock('../../../lib/utils/sanitization', () => ({
  sanitizeStoryText: vi.fn((input: string) => {
    // Mock sanitization that removes script tags
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }),
  validateStoryText: vi.fn((input: string) => {
    const hasScript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input);
    const hasJavaScript = /javascript:/gi.test(input);
    const hasEventHandlers = /on\w+\s*=/gi.test(input);
    
    const isValid = !hasScript && !hasJavaScript && !hasEventHandlers;
    const errors = isValid ? [] : ['Input contains potentially dangerous content'];
    
    return {
      isValid,
      errors,
      sanitizedText: input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
    };
  }),
}));

describe('FullPageStoryInput Security Features', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isTranslating: false,
    formData: {
      language: 'en' as LanguageCode,
      difficulty: 'a1' as DifficultyLevel,
    },
    onFormDataChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags from input', async () => {
      const { onChange } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const maliciousInput = '<script>alert("xss")</script>Hello world';

      fireEvent.change(textarea, { target: { value: maliciousInput } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('Hello world');
      });
    });

    it('should show security warning for malicious content', async () => {
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const maliciousInput = '<script>alert("xss")</script>Hello world';

      fireEvent.change(textarea, { target: { value: maliciousInput } });

      await waitFor(() => {
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
        expect(screen.getByText('Malicious content has been automatically removed for your safety.')).toBeInTheDocument();
      });
    });

    it('should prevent translation when malicious content is detected', async () => {
      const { onSubmit } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} value="<script>alert('xss')</script>Hello" />);

      const translateButton = screen.getByTestId('translate-button');
      fireEvent.click(translateButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
        // The validation error should be shown instead of the confirmation modal
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });
    });

    it('should handle javascript protocol attempts', async () => {
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const maliciousInput = 'javascript:alert("xss")';

      fireEvent.change(textarea, { target: { value: maliciousInput } });

      await waitFor(() => {
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });
    });

    it('should handle event handler attempts', async () => {
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const maliciousInput = '<img src="x" onerror="alert(\'xss\')">';

      fireEvent.change(textarea, { target: { value: maliciousInput } });

      await waitFor(() => {
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });
    });
  });

  describe('Normal Text Handling', () => {
    it('should allow normal Spanish text without warnings', async () => {
      const { onChange } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const normalText = '¡Hola mundo! ¿Cómo estás?';

      fireEvent.change(textarea, { target: { value: normalText } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(normalText);
        expect(screen.queryByText('⚠️ Security Warning')).not.toBeInTheDocument();
      });
    });

    it('should allow special characters and accents', async () => {
      const { onChange } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const textWithAccents = 'Érase una vez un gato que vivía en una casa muy bonita.';

      fireEvent.change(textarea, { target: { value: textWithAccents } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(textWithAccents);
        expect(screen.queryByText('⚠️ Security Warning')).not.toBeInTheDocument();
      });
    });

    it('should allow line breaks in normal text', async () => {
      const { onChange } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const textWithBreaks = 'Primera línea.\nSegunda línea.\nTercera línea.';

      fireEvent.change(textarea, { target: { value: textWithBreaks } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(textWithBreaks);
        expect(screen.queryByText('⚠️ Security Warning')).not.toBeInTheDocument();
      });
    });
  });

  describe('Translation Prevention', () => {
    it('should prevent translation when validation errors exist', async () => {
      const { onSubmit } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} value="<script>alert('xss')</script>Hello" />);

      const translateButton = screen.getByTestId('translate-button');
      fireEvent.click(translateButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
        // Should show security warning instead of confirmation modal
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });
    });

    it('should allow translation when text is clean', async () => {
      const { onSubmit } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} value="¡Hola mundo!" />);

      const translateButton = screen.getByTestId('translate-button');
      fireEvent.click(translateButton);

      // Should show confirmation modal first
      await waitFor(() => {
        expect(screen.getByText('Confirm Translation Options')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByText('Confirm & Translate');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('User Experience', () => {
    it('should clear security warning when user fixes the input', async () => {
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');

      // First, add malicious content
      fireEvent.change(textarea, { target: { value: '<script>alert("xss")</script>' } });

      await waitFor(() => {
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });

      // Then, replace with clean content
      fireEvent.change(textarea, { target: { value: 'Hello world' } });

      await waitFor(() => {
        expect(screen.queryByText('⚠️ Security Warning')).not.toBeInTheDocument();
      });
    });

    it('should maintain user input even when sanitized', async () => {
      const { onChange } = defaultProps;
      render(<FullPageStoryInput {...defaultProps} />);

      const textarea = screen.getByTestId('story-textarea');
      const mixedInput = 'Hello <script>alert("xss")</script> world';

      fireEvent.change(textarea, { target: { value: mixedInput } });

      await waitFor(() => {
        // Should call onChange with sanitized version
        expect(onChange).toHaveBeenCalledWith('Hello  world');
        // But should still show warning
        expect(screen.getByText('⚠️ Security Warning')).toBeInTheDocument();
      });
    });
  });
}); 