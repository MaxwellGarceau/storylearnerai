import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  validateTextInput,
  sanitizeStoryText,
  validateStoryText,
} from '../sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeText', () => {
    it('should handle null and undefined input', () => {
      expect(sanitizeText(null as unknown as string)).toBe('');
      expect(sanitizeText(undefined as unknown as string)).toBe('');
      expect(sanitizeText('')).toBe('');
    });

    it('should trim whitespace by default', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world');
    });

    it('should respect trim option', () => {
      expect(sanitizeText('  hello world  ', { trim: false })).toBe('  hello world  ');
    });

    it('should enforce max length', () => {
      const longText = 'a'.repeat(10001);
      const result = sanitizeText(longText, { maxLength: 10000 });
      expect(result.length).toBe(10000);
      expect(result).toBe('a'.repeat(10000));
    });

    it('should strip HTML tags by default', () => {
      const input = '<p>Hello <script>alert("xss")</script> world</p>';
      const result = sanitizeText(input);
      expect(result).toBe('Hello  world');
    });

    it('should allow HTML when configured', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const result = sanitizeText(input, { allowHTML: true });
      expect(result).toBe('<p>Hello <strong>world</strong></p>');
    });

    it('should strip dangerous HTML even when HTML is allowed', () => {
      const input = '<p>Hello <script>alert("xss")</script> world</p>';
      const result = sanitizeText(input, { allowHTML: true });
      expect(result).toBe('<p>Hello  world</p>');
    });

    it('should preserve line breaks by default', () => {
      const input = 'Hello\nworld\n!';
      const result = sanitizeText(input);
      expect(result).toBe('Hello\nworld\n!');
    });

    it('should remove line breaks when not allowed', () => {
      const input = 'Hello\nworld\n!';
      const result = sanitizeText(input, { allowLineBreaks: false });
      expect(result).toBe('Hello world !');
    });

    it('should convert line breaks to <br> when HTML is allowed', () => {
      const input = 'Hello\nworld\n!';
      const result = sanitizeText(input, { allowHTML: true });
      expect(result).toBe('Hello<br>world<br>!');
    });
  });

  describe('validateTextInput', () => {
    it('should validate normal text', () => {
      const result = validateTextInput('Hello world');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.sanitizedText).toBe('Hello world');
    });

    it('should detect script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should detect javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should detect event handlers', () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should detect data URLs', () => {
      const input = 'data:text/html,<script>alert("xss")</script>';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should detect iframe tags', () => {
      const input = '<iframe src="javascript:alert(\'xss\')"></iframe>';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });

    it('should validate length limits', () => {
      const longText = 'a'.repeat(10001);
      const result = validateTextInput(longText, { maxLength: 10000 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input exceeds maximum length of 10000 characters');
    });

    it('should handle empty input', () => {
      const result = validateTextInput('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input must be a non-empty string');
    });
  });

  describe('sanitizeStoryText', () => {
    it('should sanitize story text with default options', () => {
      const input = '<script>alert("xss")</script>Hello world';
      const result = sanitizeStoryText(input);
      expect(result).toBe('Hello world');
    });

    it('should preserve normal text content', () => {
      const input = '¡Hola mundo! This is a Spanish story.';
      const result = sanitizeStoryText(input);
      expect(result).toBe('¡Hola mundo! This is a Spanish story.');
    });

    it('should handle special characters', () => {
      const input = '¿Cómo estás? ¡Muy bien!';
      const result = sanitizeStoryText(input);
      expect(result).toBe('¿Cómo estás? ¡Muy bien!');
    });
  });

  describe('validateStoryText', () => {
    it('should validate normal story text', () => {
      const input = 'Érase una vez un gato que vivía en una casa muy bonita.';
      const result = validateStoryText(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.sanitizedText).toBe('Érase una vez un gato que vivía en una casa muy bonita.');
    });

    it('should reject dangerous story content', () => {
      const input = 'Érase una vez... <script>alert("xss")</script> un gato.';
      const result = validateStoryText(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle nested script tags', () => {
      const input = '<script><script>alert("xss")</script></script>';
      const result = sanitizeText(input);
      expect(result).toBe('');
    });

    it('should handle script tags with attributes', () => {
      const input = '<script type="text/javascript">alert("xss")</script>';
      const result = sanitizeText(input);
      expect(result).toBe('');
    });

    it('should handle mixed case script tags', () => {
      const input = '<SCRIPT>alert("xss")</SCRIPT>';
      const result = sanitizeText(input);
      expect(result).toBe('');
    });

    it('should handle encoded script tags', () => {
      const input = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      const result = sanitizeText(input);
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should handle vbscript protocol', () => {
      const input = 'vbscript:alert("xss")';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
    });

    it('should handle complex XSS attempts', () => {
      const input = '<img src="x" onerror="alert(\'xss\')" onload="alert(\'xss2\')">';
      const result = validateTextInput(input);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Performance and Large Inputs', () => {
    it('should handle large inputs efficiently', () => {
      const largeInput = 'a'.repeat(9999) + '<script>alert("xss")</script>';
      const result = sanitizeText(largeInput);
      expect(result.length).toBeLessThanOrEqual(10000);
      expect(result).not.toContain('<script>');
      // DOMPurify might add some whitespace, so we just check the length is reasonable
      expect(result.length).toBeGreaterThan(9990);
    });

    it('should handle inputs at max length', () => {
      const maxInput = 'a'.repeat(10000);
      const result = sanitizeText(maxInput);
      expect(result.length).toBe(10000);
      expect(result).toBe(maxInput);
    });
  });
}); 