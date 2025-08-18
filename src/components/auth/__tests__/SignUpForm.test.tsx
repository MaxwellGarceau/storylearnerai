import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import { SignUpForm } from '../SignUpForm'
import { setupSupabaseMocks, mockUseAuth } from '../../../__tests__/mocks/supabaseMock'

// Setup Supabase mocks
setupSupabaseMocks()

describe('SignUpForm Component', () => {
  const mockSignUp = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnSwitchToSignIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: false,
      error: null
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders sign up form with all required fields', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /create account/i })[0]).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/username/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(displayNameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(usernameInput).toHaveValue('testuser')
    expect(displayNameInput).toHaveValue('Test User')
    expect(passwordInput).toHaveValue('Password123!')
    expect(confirmPasswordInput).toHaveValue('Password123!')
  })

  it('validates password strength requirements', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument()
    expect(screen.getByText('One number')).toBeInTheDocument()
    expect(screen.getByText('One special character')).toBeInTheDocument()

    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument()
    expect(screen.getByText('One number')).toBeInTheDocument()
    expect(screen.getByText('One special character')).toBeInTheDocument()
  })

  it('validates password confirmation match', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } })

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    mockSignUp.mockResolvedValue(true)

    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/username/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getAllByRole('button', { name: /create account/i })[0]

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(displayNameInput, { target: { value: 'Test User' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123!')
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles sign up error', () => {
    const errorMessage = 'Email already exists'
    
    // Mock the error state from useAuth
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: false,
      error: errorMessage
    })

    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('switches to sign in mode when link is clicked', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const signInLink = screen.getAllByText(/sign in/i)[0]
    fireEvent.click(signInLink)

    expect(mockOnSwitchToSignIn).toHaveBeenCalled()
  })

  it('disables form during loading', () => {
    // Mock the loading state from useAuth
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: true,
      error: null
    })

    render(<SignUpForm onSuccess={mockOnSuccess} onSwitchToSignIn={mockOnSwitchToSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const usernameInput = screen.getByLabelText(/username/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getAllByRole('button', { name: /creating account/i })[0]

    expect(emailInput).toBeDisabled()
    expect(usernameInput).toBeDisabled()
    expect(displayNameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(confirmPasswordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
}) 