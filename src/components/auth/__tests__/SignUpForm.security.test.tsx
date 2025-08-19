import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { SignUpForm } from '../SignUpForm';

// Mock the useAuth hook
const mockSignUp = vi.fn();
const mockUseAuth = vi.fn(() => ({
  signUp: mockSignUp,
  loading: false,
  error: null,
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('SignUpForm Security', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onSwitchToSignIn: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Email Input Security', () => {
    it('should sanitize malicious email input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = '<script>alert("xss")</script>user@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(emailInput).toHaveValue('user@example.com');
      });
    });

    it('should show validation error for malicious email content', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const maliciousEmail = '<script>alert("xss")</script>user@example.com';

      fireEvent.change(emailInput, { target: { value: maliciousEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const invalidEmail = 'invalid-email';

      fireEvent.change(emailInput, { target: { value: invalidEmail } });

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });
  });

  describe('Username Input Security', () => {
    it('should sanitize malicious username input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const maliciousUsername = '<script>alert("xss")</script>user123';

      fireEvent.change(usernameInput, { target: { value: maliciousUsername } });

      await waitFor(() => {
        expect(usernameInput).toHaveValue('user123');
      });
    });

    it('should show validation error for malicious username content', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const maliciousUsername = '<script>alert("xss")</script>user123';

      fireEvent.change(usernameInput, { target: { value: maliciousUsername } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should validate username format', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const invalidUsername = 'user@name';

      fireEvent.change(usernameInput, { target: { value: invalidUsername } });

      await waitFor(() => {
        expect(screen.getByText('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens')).toBeInTheDocument();
      });
    });

    it('should reject usernames that are too short', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const shortUsername = 'ab';

      fireEvent.change(usernameInput, { target: { value: shortUsername } });

      await waitFor(() => {
        expect(screen.getByText('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens')).toBeInTheDocument();
      });
    });

    it('should allow valid usernames', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const validUsername = 'user123';

      fireEvent.change(usernameInput, { target: { value: validUsername } });

      await waitFor(() => {
        expect(usernameInput).toHaveValue(validUsername);
        expect(screen.queryByText(/invalid|error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Display Name Input Security', () => {
    it('should sanitize malicious display name input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const displayNameInput = screen.getByLabelText('Display Name');
      const maliciousDisplayName = '<script>alert("xss")</script>John Doe';

      fireEvent.change(displayNameInput, { target: { value: maliciousDisplayName } });

      await waitFor(() => {
        expect(displayNameInput).toHaveValue('John Doe');
      });
    });

    it('should show validation error for malicious display name content', async () => {
      render(<SignUpForm {...defaultProps} />);

      const displayNameInput = screen.getByLabelText('Display Name');
      const maliciousDisplayName = '<script>alert("xss")</script>John Doe';

      fireEvent.change(displayNameInput, { target: { value: maliciousDisplayName } });

      await waitFor(() => {
        expect(screen.getByText('Input contains potentially dangerous content')).toBeInTheDocument();
      });
    });

    it('should validate display name length', async () => {
      render(<SignUpForm {...defaultProps} />);

      const displayNameInput = screen.getByLabelText('Display Name');
      const shortDisplayName = 'A';

      fireEvent.change(displayNameInput, { target: { value: shortDisplayName } });

      await waitFor(() => {
        expect(screen.getByText('Display name must be at least 2 characters long')).toBeInTheDocument();
      });
    });

    it('should allow valid display names', async () => {
      render(<SignUpForm {...defaultProps} />);

      const displayNameInput = screen.getByLabelText('Display Name');
      const validDisplayName = 'John Doe';

      fireEvent.change(displayNameInput, { target: { value: validDisplayName } });

      await waitFor(() => {
        expect(displayNameInput).toHaveValue(validDisplayName);
        expect(screen.queryByText(/invalid|error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission Security', () => {
    it('should submit form with clean input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const usernameInput = screen.getByLabelText('Username');
      const displayNameInput = screen.getByLabelText('Display Name');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'user123' } });
      fireEvent.change(displayNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(passwordInput, { target: { value: 'MySecurePassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'MySecurePassword123!' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'MySecurePassword123!');
      });
    });

    it('should not submit form with validation errors', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const usernameInput = screen.getByLabelText('Username');
      const displayNameInput = screen.getByLabelText('Display Name');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: '<script>alert("xss")</script>user@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'user123' } });
      fireEvent.change(displayNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(passwordInput, { target: { value: 'MySecurePassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'MySecurePassword123!' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });

    it('should disable submit button when validation errors exist', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: '<script>alert("xss")</script>user@example.com' } });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Input Length Security', () => {
    it('should handle extremely long email input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      const longEmail = 'a'.repeat(300) + '@example.com';

      fireEvent.change(emailInput, { target: { value: longEmail } });

      await waitFor(() => {
        expect(screen.getByText('Input exceeds maximum length of 254 characters')).toBeInTheDocument();
      });
    });

    it('should handle extremely long username input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText('Username');
      const longUsername = 'a'.repeat(60);

      fireEvent.change(usernameInput, { target: { value: longUsername } });

      await waitFor(() => {
        expect(screen.getByText('Input exceeds maximum length of 50 characters')).toBeInTheDocument();
      });
    });

    it('should handle extremely long display name input', async () => {
      render(<SignUpForm {...defaultProps} />);

      const displayNameInput = screen.getByLabelText('Display Name');
      const longDisplayName = 'a'.repeat(300);

      fireEvent.change(displayNameInput, { target: { value: longDisplayName } });

      await waitFor(() => {
        expect(screen.getByText('Input exceeds maximum length of 255 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Password Security', () => {
    it('should maintain existing password strength validation', async () => {
      render(<SignUpForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      const weakPassword = 'weak';

      fireEvent.change(passwordInput, { target: { value: weakPassword } });

      await waitFor(() => {
        // Should show password strength indicators
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
        expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
        expect(screen.getByText('One number')).toBeInTheDocument();
        expect(screen.getByText('One special character')).toBeInTheDocument();
      });
    });

    it('should allow strong passwords with special characters', async () => {
      render(<SignUpForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Password');
      const strongPassword = 'MySecurePassword123!';

      fireEvent.change(passwordInput, { target: { value: strongPassword } });

      await waitFor(() => {
        // Verify that all password requirements are met
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
        expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
        expect(screen.getByText('One number')).toBeInTheDocument();
        expect(screen.getByText('One special character')).toBeInTheDocument();
      });
    });
  });
}); 