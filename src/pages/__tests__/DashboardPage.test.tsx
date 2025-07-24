import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'
import { useSupabase } from '../../hooks/useSupabase'
import { UserService } from '../../api/supabase'

// Mock the useSupabase hook
vi.mock('../../hooks/useSupabase')

// Mock the UserService
vi.mock('../../api/supabase', () => ({
  UserService: {
    getUser: vi.fn()
  }
}))

const mockUseSupabase = useSupabase as vi.MockedFunction<typeof useSupabase>
const mockUserService = UserService as vi.Mocked<typeof UserService>

// Mock react-router-dom hooks
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('DashboardPage Component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockProfile = {
    id: 'profile-123',
    user_id: 'user-123',
    display_name: 'Test User',
    username: 'testuser',
    preferred_language: 'en',
    bio: 'Test bio',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSupabase.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: mockUser,
      loading: false,
      error: null
    })
    mockUserService.getUser.mockResolvedValue(mockProfile)
  })

  it('renders dashboard with user information', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
      expect(screen.getByText('Your language learning dashboard')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching data', () => {
    mockUserService.getUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithRouter(<DashboardPage />)

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })

  it('displays error message when data loading fails', async () => {
    mockUserService.getUser.mockRejectedValue(new Error('Failed to load data'))

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })

  it('shows sign in message when user is not authenticated', async () => {
    mockUseSupabase.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: null,
      loading: false,
      error: null
    })

    renderWithRouter(<DashboardPage />)

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Please sign in to access your dashboard')).toBeInTheDocument()
    })
  })

  it('displays user profile information', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const profileTexts = screen.getAllByText('Your Profile')
      expect(profileTexts[0]).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('@testuser')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('12/31/2023')).toBeInTheDocument() // Formatted date
    })
  })

  it('handles missing display name gracefully', async () => {
    const profileWithoutDisplayName = {
      ...mockProfile,
      display_name: null
    }
    mockUserService.getUser.mockResolvedValue(profileWithoutDisplayName)

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Welcome back, test!')).toBeInTheDocument() // Uses email prefix
    })
  })

  it('handles missing username gracefully', async () => {
    const profileWithoutUsername = {
      ...mockProfile,
      username: null
    }
    mockUserService.getUser.mockResolvedValue(profileWithoutUsername)

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Not set')).toBeInTheDocument()
    })
  })

  it('navigates to profile page when profile button is clicked', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(mockUserService.getUser).toHaveBeenCalled()
    })

    const profileButton = screen.getAllByRole('button', { name: /profile/i })[0]
    fireEvent.click(profileButton)

    expect(mockNavigate).toHaveBeenCalledWith('/auth')
  })

  it('navigates to translate page when new translation button is clicked', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(mockUserService.getUser).toHaveBeenCalled()
    })

    const newTranslationButton = screen.getAllByRole('button', { name: /new translation/i })[0]
    fireEvent.click(newTranslationButton)

    expect(mockNavigate).toHaveBeenCalledWith('/translate')
  })

  it('navigates to translate page when start translating button is clicked', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(mockUserService.getUser).toHaveBeenCalled()
    })

    const startTranslatingButton = screen.getAllByRole('button', { name: /start translating/i })[0]
    fireEvent.click(startTranslatingButton)

    expect(mockNavigate).toHaveBeenCalledWith('/translate')
  })

  it('displays correct language names', async () => {
    const spanishProfile = {
      ...mockProfile,
      preferred_language: 'es'
    }
    mockUserService.getUser.mockResolvedValue(spanishProfile)

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Spanish')).toBeInTheDocument()
    })
  })

  it('handles unknown language codes gracefully', async () => {
    const unknownLanguageProfile = {
      ...mockProfile,
      preferred_language: 'xx'
    }
    mockUserService.getUser.mockResolvedValue(unknownLanguageProfile)

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('xx')).toBeInTheDocument() // Shows the code as-is
    })
  })

  it('renders quick start card', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Get Started')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Start translating and learning with Story Learner AI')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Ready to start your language learning journey?')[0]).toBeInTheDocument()
    })
  })

  it('renders profile card with account information', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const profileTexts = screen.getAllByText('Your Profile')
      expect(profileTexts[0]).toBeInTheDocument()
      expect(screen.getAllByText('Your account information and preferences')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Display Name')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Username')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Preferred Language')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Member Since')[0]).toBeInTheDocument()
    })
  })

  it('calls getUser with correct user ID', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(mockUserService.getUser).toHaveBeenCalledWith('user-123')
    })
  })

  it('handles loading state correctly', () => {
    mockUseSupabase.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      user: mockUser,
      loading: true,
      error: null
    })

    renderWithRouter(<DashboardPage />)

    const loadingTexts = screen.getAllByText('Loading your dashboard...')
    expect(loadingTexts[0]).toBeInTheDocument()
  })

  it('displays error alert when there is an error', async () => {
    mockUserService.getUser.mockRejectedValue(new Error('Database error'))

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('formats date correctly', async () => {
    const profileWithDifferentDate = {
      ...mockProfile,
      created_at: '2024-12-25T10:30:00Z'
    }
    mockUserService.getUser.mockResolvedValue(profileWithDifferentDate)

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('12/25/2024')).toBeInTheDocument()
    })
  })
}) 