import { describe, it, expect } from 'vitest';
import {
  sanitizeEmail,
  validateEmail,
  sanitizeUsername,
  validateUsername,
  sanitizeDisplayName,
  validateDisplayName,
} from '../sanitization';

describe('Authentication Sanitization Utilities', () => {
  describe('Email Sanitization and Validation', () => {
    describe('sanitizeEmail', () => {
      it('should sanitize normal email addresses', () => {
        expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
        expect(sanitizeEmail('test.user+tag@domain.co.uk')).toBe(
          'test.user+tag@domain.co.uk'
        );
      });

      it('should remove HTML tags from email', () => {
        expect(
          sanitizeEmail('<script>alert("xss")</script>user@example.com')
        ).toBe('user@example.com');
        expect(
          sanitizeEmail('user@example.com<script>alert("xss")</script>')
        ).toBe('user@example.com');
      });

      it('should trim whitespace', () => {
        expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
      });

      it('should enforce max length', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
      });

      it('should handle empty input', () => {
        expect(sanitizeEmail('')).toBe('');
        expect(sanitizeEmail(null as unknown as string)).toBe('');
        expect(sanitizeEmail(undefined as unknown as string)).toBe('');
      });
    });

    describe('validateEmail', () => {
      it('should validate correct email formats', () => {
        const validEmails = [
          'user@example.com',
          'test.user@domain.co.uk',
          'user+tag@example.com',
          'user.name@subdomain.example.com',
        ];

        validEmails.forEach(email => {
          const result = validateEmail(email);
          expect(result.isValid).toBe(true);
          expect(result.errors).toEqual([]);
          expect(result.sanitizedText).toBe(email);
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'user@',
          '@example.com',
          'user@.com',
          'user.example.com',
          'user@example',
          'user space@example.com',
        ];

        invalidEmails.forEach(email => {
          const result = validateEmail(email);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('Invalid email format');
        });
      });

      it('should detect malicious content', () => {
        const maliciousEmails = [
          '<script>alert("xss")</script>user@example.com',
          'user@example.com<script>alert("xss")</script>',
          'javascript:alert("xss")@example.com',
          'user@example.com<img src="x" onerror="alert(\'xss\')">',
        ];

        maliciousEmails.forEach(email => {
          const result = validateEmail(email);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Input contains potentially dangerous content'
          );
        });
      });

      it('should handle length validation', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const result = validateEmail(longEmail);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Input exceeds maximum length of 254 characters'
        );
      });
    });
  });

  describe('Username Sanitization and Validation', () => {
    describe('sanitizeUsername', () => {
      it('should sanitize valid usernames', () => {
        expect(sanitizeUsername('user123')).toBe('user123');
        expect(sanitizeUsername('user_name')).toBe('user_name');
        expect(sanitizeUsername('user-name')).toBe('user-name');
        expect(sanitizeUsername('User123')).toBe('User123');
      });

      it('should remove HTML tags from username', () => {
        expect(sanitizeUsername('<script>alert("xss")</script>user123')).toBe(
          'user123'
        );
        expect(sanitizeUsername('user123<script>alert("xss")</script>')).toBe(
          'user123'
        );
      });

      it('should trim whitespace', () => {
        expect(sanitizeUsername('  user123  ')).toBe('user123');
      });

      it('should enforce max length', () => {
        const longUsername = 'a'.repeat(60);
        expect(sanitizeUsername(longUsername).length).toBeLessThanOrEqual(50);
      });

      it('should handle empty input', () => {
        expect(sanitizeUsername('')).toBe('');
        expect(sanitizeUsername(null as unknown as string)).toBe('');
        expect(sanitizeUsername(undefined as unknown as string)).toBe('');
      });
    });

    describe('validateUsername', () => {
      it('should validate correct username formats', () => {
        const validUsernames = [
          'user123',
          'user_name',
          'user-name',
          'User123',
          'user_123',
          'user-name_123',
        ];

        validUsernames.forEach(username => {
          const result = validateUsername(username);
          expect(result.isValid).toBe(true);
          expect(result.errors).toEqual([]);
          expect(result.sanitizedText).toBe(username);
        });
      });

      it('should reject usernames that are too short', () => {
        const shortUsernames = ['ab', 'a'];
        shortUsernames.forEach(username => {
          const result = validateUsername(username);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'
          );
        });
      });

      it('should reject empty usernames', () => {
        const result = validateUsername('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input must be a non-empty string');
      });

      it('should reject usernames with invalid characters', () => {
        const invalidUsernames = [
          'user@name',
          'user name',
          'user.name',
          'user!name',
          'user#name',
          'user$name',
        ];

        invalidUsernames.forEach(username => {
          const result = validateUsername(username);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'
          );
        });
      });

      it('should detect malicious content', () => {
        const maliciousUsernames = [
          '<script>alert("xss")</script>user123',
          'user123<script>alert("xss")</script>',
          'javascript:alert("xss")',
          'user123<img src="x" onerror="alert(\'xss\')">',
        ];

        maliciousUsernames.forEach(username => {
          const result = validateUsername(username);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Input contains potentially dangerous content'
          );
        });
      });

      it('should handle length validation', () => {
        const longUsername = 'a'.repeat(60);
        const result = validateUsername(longUsername);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Input exceeds maximum length of 50 characters'
        );
      });
    });
  });

  describe('Display Name Sanitization and Validation', () => {
    describe('sanitizeDisplayName', () => {
      it('should sanitize valid display names', () => {
        expect(sanitizeDisplayName('John Doe')).toBe('John Doe');
        expect(sanitizeDisplayName('Mary Jane')).toBe('Mary Jane');
        expect(sanitizeDisplayName('Dr. Smith')).toBe('Dr. Smith');
        expect(sanitizeDisplayName("O'Connor")).toBe("O'Connor");
      });

      it('should remove HTML tags from display names', () => {
        expect(
          sanitizeDisplayName('<script>alert("xss")</script>John Doe')
        ).toBe('John Doe');
        expect(
          sanitizeDisplayName('John Doe<script>alert("xss")</script>')
        ).toBe('John Doe');
      });

      it('should trim whitespace', () => {
        expect(sanitizeDisplayName('  John Doe  ')).toBe('John Doe');
      });

      it('should enforce max length', () => {
        const longName = 'a'.repeat(300);
        expect(sanitizeDisplayName(longName).length).toBeLessThanOrEqual(255);
      });

      it('should handle empty input', () => {
        expect(sanitizeDisplayName('')).toBe('');
        expect(sanitizeDisplayName(null as unknown as string)).toBe('');
        expect(sanitizeDisplayName(undefined as unknown as string)).toBe('');
      });
    });

    describe('validateDisplayName', () => {
      it('should validate correct display name formats', () => {
        const validNames = [
          'John Doe',
          'Mary Jane',
          'Dr. Smith',
          "O'Connor",
          'Jean-Pierre',
          'José María',
        ];

        validNames.forEach(name => {
          const result = validateDisplayName(name);
          expect(result.isValid).toBe(true);
          expect(result.errors).toEqual([]);
          expect(result.sanitizedText).toBe(name);
        });
      });

      it('should reject display names that are too short', () => {
        const shortNames = ['A'];
        shortNames.forEach(name => {
          const result = validateDisplayName(name);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Display name must be at least 2 characters long'
          );
        });
      });

      it('should reject empty display names', () => {
        const result = validateDisplayName('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Input must be a non-empty string');
      });

      it('should reject display names that are too long', () => {
        const longName = 'a'.repeat(150);
        const result = validateDisplayName(longName);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Display name must be 100 characters or less'
        );
      });

      it('should detect malicious content', () => {
        const maliciousNames = [
          '<script>alert("xss")</script>John Doe',
          'John Doe<script>alert("xss")</script>',
          'javascript:alert("xss")',
          'John Doe<img src="x" onerror="alert(\'xss\')">',
        ];

        maliciousNames.forEach(name => {
          const result = validateDisplayName(name);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            'Input contains potentially dangerous content'
          );
        });
      });

      it('should handle length validation', () => {
        const longName = 'a'.repeat(300);
        const result = validateDisplayName(longName);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Input exceeds maximum length of 255 characters'
        );
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle mixed case script tags', () => {
      expect(
        validateEmail('<SCRIPT>alert("xss")</SCRIPT>user@example.com').isValid
      ).toBe(false);
      expect(
        validateUsername('<SCRIPT>alert("xss")</SCRIPT>user123').isValid
      ).toBe(false);
      expect(
        validateDisplayName('<SCRIPT>alert("xss")</SCRIPT>John Doe').isValid
      ).toBe(false);
    });

    it('should handle encoded script tags', () => {
      // Encoded script tags should be allowed as they are not executable
      expect(
        validateEmail(
          '&lt;script&gt;alert("xss")&lt;/script&gt;user@example.com'
        ).isValid
      ).toBe(true);
      expect(
        validateUsername('&lt;script&gt;alert("xss")&lt;/script&gt;user123')
          .isValid
      ).toBe(false); // Username format validation fails
      expect(
        validateDisplayName('&lt;script&gt;alert("xss")&lt;/script&gt;John Doe')
          .isValid
      ).toBe(true);
    });

    it('should handle event handlers', () => {
      expect(
        validateEmail('user@example.com<img src="x" onerror="alert(\'xss\')">')
          .isValid
      ).toBe(false);
      expect(
        validateUsername('user123<img src="x" onerror="alert(\'xss\')">')
          .isValid
      ).toBe(false);
      expect(
        validateDisplayName('John Doe<img src="x" onerror="alert(\'xss\')">')
          .isValid
      ).toBe(false);
    });

    it('should handle javascript protocol', () => {
      expect(validateEmail('javascript:alert("xss")@example.com').isValid).toBe(
        false
      );
      expect(validateUsername('javascript:alert("xss")').isValid).toBe(false);
      expect(validateDisplayName('javascript:alert("xss")').isValid).toBe(
        false
      );
    });
  });
});
