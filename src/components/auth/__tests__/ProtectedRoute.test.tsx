import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ProtectedRoute } from '../ProtectedRoute'
import { useSupabase } from '../../../hooks/useSupabase'
import type { User } from '@supabase/supabase-js'

// Mock the useSupabase hook
vi.mock('../../../hooks/useSupabase')

const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner when checking authentication', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect unauthenticated users to homepage', async () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render protected content for authenticated users', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      identities: [],
      factors: []
    }
    
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should not redirect when loading', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(mockNavigate).not.toHaveBeenCalled()
  })
}) 