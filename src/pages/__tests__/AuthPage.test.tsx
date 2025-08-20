import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthPage } from '../AuthPage'
import { setupSupabaseMocks, mockUseAuth } from '../../__tests__/mocks/supabaseMock'
import { MemoryRouter } from 'react-router-dom'

// Setup Supabase mocks
setupSupabaseMocks()

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  }
})

describe('AuthPage Component', () => {
  vi.mock('react-i18next', async () => {
    const actual = await vi.importActual('react-i18next')
    return {
      ...actual,
      useTranslation: () => ({
        t: (key: string) => {
          const dict: Record<string, string> = {
            'common.loading': 'Loading...',
            'common.backToHome': 'Back to Home',
            'auth.signIn.title': 'Sign In',
            'auth.signUp.title': 'Create Account',
          }
          return dict[key] || key
        },
      }),
    }
  })
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: false,
      error: null
    })
  })

  it('renders sign in form by default', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign up form when mode is signup', () => {
    mockSearchParams = new URLSearchParams('mode=signup')
    
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      user: null,
      loading: true,
      error: null
    })

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles mode switching', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    )

    // Initially shows sign in
    expect(screen.getAllByRole('heading', { name: 'Sign In' })[0]).toBeInTheDocument()

    // Switch to sign up
    const signUpLink = screen.getAllByText(/sign up/i)[0]
    signUpLink.click()

    expect(mockSetSearchParams).toHaveBeenCalledWith({ mode: 'signup' })
  })
}) 