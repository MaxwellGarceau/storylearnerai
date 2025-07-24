import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'
import { useSupabase } from '../../hooks/useSupabase'
import { UserService } from '../../api/supabase'

// Mock the useLanguages hook
vi.mock('../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { id: '1', code: 'en', name: 'English', native_name: 'English', created_at: '2023-01-01T00:00:00Z' },
      { id: '2', code: 'es', name: 'Spanish', native_name: 'Español', created_at: '2023-01-01T00:00:00Z' }
    ],
    loading: false,
    error: null,
    getLanguageName: (code: string) => {
      const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish'
      }
      return languageMap[code] || code
    },
    languageMap: new Map([
      ['en', 'English'],
      ['es', 'Spanish']
    ])
  })
}))

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

  it('renders quick actions section', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getAllByText('New Translation')).toHaveLength(2) // Header button and quick action card
      expect(screen.getByText('View Saved')).toBeInTheDocument()
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })
  })

  it('renders stats cards with correct information', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Total Translations')).toBeInTheDocument()
      expect(screen.getByText('Languages')).toBeInTheDocument()
      expect(screen.getByText('Learning Level')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Total translations
      expect(screen.getByText('1')).toBeInTheDocument() // Languages count
      expect(screen.getAllByText('Beginner')).toHaveLength(2) // Badge and card content
    })
  })

  it('displays correct language names in stats', async () => {
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

  it('handles unknown language codes gracefully in stats', async () => {
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

  it('renders recent activity section', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Recent Activity')).toBeTruthy()
      // Find the specific "No recent activity" text by looking for the h3 element within the Recent Activity section
      const recentActivitySections = screen.getAllByText('Recent Activity')
      const recentActivitySection = recentActivitySections[0].closest('div')
      const noActivityHeading = recentActivitySection?.querySelector('h3')
      expect(noActivityHeading).toHaveTextContent('No recent activity')
      expect(screen.getAllByText('Start translating stories to see your activity here')).toBeTruthy()
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

  it('displays welcome message with user name', async () => {
    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Welcome back, Test User!')).toBeTruthy()
      // Check that the dashboard subtitle is present
      expect(screen.getAllByText('Your language learning dashboard')).toBeTruthy()
    })
  })
}) 