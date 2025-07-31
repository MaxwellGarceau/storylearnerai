import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { SignInForm } from '../SignInForm';

// Mock the useSupabase hook
const mockSignIn = vi.fn();
const mockUseSupabase = vi.fn(() => ({
  signIn: mockSignIn,
  loading: false,
  error: null,
}));

vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: () => mockUseSupabase(),
}));

describe('SignInForm Security', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onSwitchToSignUp: vi.fn(),
    onForgotPassword: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Email Input Security', () => {
    it('should sanitize malicious email input', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = '<script>alert("xss")</script>user@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(emailInput).toHaveValue('user@example.com');
      });
    });

    it('should show validation error for malicious email content', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = '<script>alert("xss")</script>user@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should prevent form submission with malicious email', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      const maliciousEmail = '<script>alert("xss")</script>user@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
      });
    });

    it('should handle javascript protocol in email', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = 'javascript:alert("xss")@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should handle event handlers in email', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = 'user@example.com<img src="x" onerror="alert(\'xss\')">';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const invalidEmail = 'invalid-email';

      fireEvent.change(emailInput, { target: { value: invalidEmail } });

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should allow valid email formats', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const validEmail = 'user@example.com';

      fireEvent.change(emailInput, { target: { value: validEmail } });

      await waitFor(() => {
        expect(emailInput).toHaveValue(validEmail);
        expect(screen.queryByText(/invalid|error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Input Security', () => {
    it('should allow normal password input', async () => {
      render(<SignInForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      const normalPassword = 'MySecurePassword123!';

      fireEvent.change(passwordInput, { target: { value: normalPassword } });

      await waitFor(() => {
        expect(passwordInput).toHaveValue(normalPassword);
      });
    });

    it('should handle malicious content in password', async () => {
      render(<SignInForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      const maliciousPassword = '<script>alert("xss")</script>password123';

      fireEvent.change(passwordInput, { target: { value: maliciousPassword } });

      await waitFor(() => {
        expect(passwordInput).toHaveValue(maliciousPassword);
        // Password validation is handled by Supabase, so we don't show validation errors
      });
    });
  });

  describe('Form Submission Security', () => {
    it('should submit form with clean input', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
      });
    });

    it('should not submit form with validation errors', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: '<script>alert("xss")</script>user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Length Security', () => {
    it('should handle extremely long email input', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const longEmail = 'a'.repeat(300) + '@example.com';

      fireEvent.change(emailInput, { target: { value: longEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input exceeds maximum length of 254 characters')).toBeInTheDocument();
      });
    });

    it('should trim whitespace from email', async () => {
      render(<SignInForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const emailWithWhitespace = '  user@example.com  ';

      fireEvent.change(emailInput, { target: { value: emailWithWhitespace } });

      await waitFor(() => {
        expect(emailInput).toHaveValue('user@example.com');
      });
    });
  });
}); 