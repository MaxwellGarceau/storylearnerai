import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UserProfile } from '../UserProfile'

// Mock the hooks and services
vi.mock('../../../hooks/useSupabase', () => ({
  useSupabase: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    },
    signOut: vi.fn()
  })
}))

vi.mock('../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' }
    ],
    getLanguageName: vi.fn((code: string) => {
      const languageMap: Record<string, string> = {
        en: 'English',
        es: 'Spanish'
      }
      return languageMap[code] || code
    })
  })
}))

vi.mock('../../../api/supabase', () => ({
  UserService: {
    getOrCreateUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      username: 'testuser',
      display_name: 'Test User',
      preferred_language: 'en',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }),
    updateUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      username: 'updateduser',
      display_name: 'Updated User',
      preferred_language: 'en',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    })
  }
}))

// Mock the sanitization utilities
vi.mock('../../../lib/utils/sanitization', () => ({
  validateUsername: vi.fn((input: string) => {
    if (input.includes('<script>')) {
      return {
        isValid: false,
        errors: ['Username contains potentially dangerous content'],
        sanitizedText: input.replace(/<script[^>]*>.*?<\/script>/gi, '')
      }
    }
    if (input.length < 3) {
      return {
        isValid: false,
        errors: ['Username must be at least 3 characters long'],
        sanitizedText: input
      }
    }
    return {
      isValid: true,
      errors: [],
      sanitizedText: input
    }
  }),
  validateDisplayName: vi.fn((input: string) => {
    if (input.includes('<script>')) {
      return {
        isValid: false,
        errors: ['Display name contains potentially dangerous content'],
        sanitizedText: input.replace(/<script[^>]*>.*?<\/script>/gi, '')
      }
    }
    if (input.length < 2) {
      return {
        isValid: false,
        errors: ['Display name must be at least 2 characters long'],
        sanitizedText: input
      }
    }
    return {
      isValid: true,
      errors: [],
      sanitizedText: input
    }
  }),
  sanitizeText: vi.fn((input: string, options?: any) => {
    const maxLength = options?.maxLength || 100
    const sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '')
    return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized
  })
}))

describe('UserProfile Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load profile and display edit button', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Check that edit button is present
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('should validate username input and show error for malicious content', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Find username input and enter malicious content
    const usernameInput = screen.getByPlaceholderText('Username')
    fireEvent.change(usernameInput, { target: { value: '<script>alert("xss")</script>malicious' } })

    // Check that validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Username contains potentially dangerous content')).toBeInTheDocument()
    })

    // Check that save button is disabled
    const saveButton = screen.getByText('Save Changes')
    expect(saveButton).toBeDisabled()
  })

  it('should validate display name input and show error for short input', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Find display name input and enter short content
    const displayNameInput = screen.getByPlaceholderText('Display name')
    fireEvent.change(displayNameInput, { target: { value: 'A' } })

    // Check that validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Display name must be at least 2 characters long')).toBeInTheDocument()
    })

    // Check that save button is disabled
    const saveButton = screen.getByText('Save Changes')
    expect(saveButton).toBeDisabled()
  })

  it('should sanitize input and remove malicious content', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Find username input and enter content with script tags
    const usernameInput = screen.getByPlaceholderText('Username')
    const maliciousInput = '<script>alert("xss")</script>validusername'
    fireEvent.change(usernameInput, { target: { value: maliciousInput } })

    // Check that the input is sanitized (script tags removed)
    await waitFor(() => {
      expect(usernameInput).toHaveValue('validusername')
    })
  })

  it('should allow saving when all inputs are valid', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Enter valid inputs
    const usernameInput = screen.getByPlaceholderText('Username')
    const displayNameInput = screen.getByPlaceholderText('Display name')
    
    fireEvent.change(usernameInput, { target: { value: 'validusername' } })
    fireEvent.change(displayNameInput, { target: { value: 'Valid Display Name' } })

    // Check that save button is enabled
    await waitFor(() => {
      const saveButton = screen.getByText('Save Changes')
      expect(saveButton).not.toBeDisabled()
    })
  })

  it('should clear validation errors when canceling', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Enter invalid input to trigger validation error
    const usernameInput = screen.getByPlaceholderText('Username')
    fireEvent.change(usernameInput, { target: { value: '<script>alert("xss")</script>' } })

    // Check that validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Username contains potentially dangerous content')).toBeInTheDocument()
    })

    // Click cancel button
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Check that validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Username contains potentially dangerous content')).not.toBeInTheDocument()
    })
  })

  it('should show red border for invalid inputs', async () => {
    render(<UserProfile />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Enter invalid input
    const usernameInput = screen.getByPlaceholderText('Username')
    fireEvent.change(usernameInput, { target: { value: '<script>alert("xss")</script>' } })

    // Check that input has red border
    await waitFor(() => {
      expect(usernameInput).toHaveClass('border-red-500')
    })
  })
}) 