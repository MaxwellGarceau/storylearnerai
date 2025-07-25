import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import { SignInForm } from '../SignInForm'
import { setupSupabaseMocks, mockUseSupabase } from '../../../__tests__/mocks/supabaseMock'

// Setup Supabase mocks
setupSupabaseMocks()

describe('SignInForm Component', () => {
  const mockSignIn = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnSwitchToSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    mockUseSupabase.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
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

  it('renders sign in form with all required fields', () => {
    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /sign in/i })[0]).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('Password123!')
  })

  it('submits form with valid data', async () => {
    mockSignIn.mockResolvedValue(true)

    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0]

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password123!')
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles sign in error', async () => {
    const errorMessage = 'Invalid credentials'
    
    // Mock the error state from useSupabase
    mockUseSupabase.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: false,
      error: errorMessage
    })

    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('switches to sign up mode when link is clicked', () => {
    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    const signUpLink = screen.getAllByText(/sign up/i)[0]
    fireEvent.click(signUpLink)

    expect(mockOnSwitchToSignUp).toHaveBeenCalled()
  })

  it('disables form during loading', async () => {
    // Mock the loading state from useSupabase
    mockUseSupabase.mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: true,
      error: null
    })

    render(<SignInForm onSuccess={mockOnSuccess} onSwitchToSignUp={mockOnSwitchToSignUp} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getAllByRole('button', { name: /signing in/i })[0]

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
}) 