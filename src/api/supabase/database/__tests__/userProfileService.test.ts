import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../userProfileService'
import type { CreateUserData, UpdateUserData } from '../userProfileService'

// Create comprehensive mock query builder
const createMockQueryBuilder = () => {
  const mockBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'test-user-id',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        preferred_language: 'en',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      error: null
    })
  }
  return mockBuilder
}

// Mock Supabase client
vi.mock('../client', () => ({
  supabase: {
    from: vi.fn(() => createMockQueryBuilder())
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

describe('UserService Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    const validUserData: CreateUserData = {
      id: 'test-user-id',
      username: 'testuser',
      display_name: 'Test User',
      preferred_language: 'en'
    }

    it('should create user with valid data', async () => {
      const result = await UserService.createUser(validUserData)
      expect(result).toBeDefined()
      expect(result.id).toBe('test-user-id')
    })

    it('should reject malicious content in username', async () => {
      const maliciousData = {
        ...validUserData,
        username: '<script>alert("xss")</script>malicious'
      }

      await expect(UserService.createUser(maliciousData))
        .rejects.toThrow('Validation failed: username: Input contains potentially dangerous content')
    })

    it('should reject malicious content in display name', async () => {
      const maliciousData = {
        ...validUserData,
        display_name: '<script>alert("xss")</script>Malicious Name'
      }

      await expect(UserService.createUser(maliciousData))
        .rejects.toThrow('Validation failed: display_name: Input contains potentially dangerous content')
    })

    it('should reject invalid user ID', async () => {
      const invalidData = {
        ...validUserData,
        id: ''
      }

      await expect(UserService.createUser(invalidData))
        .rejects.toThrow('Validation failed: id: Valid user ID is required')
    })

    it('should reject invalid preferred language', async () => {
      const invalidData = {
        ...validUserData,
        preferred_language: 'invalid'
      }

      await expect(UserService.createUser(invalidData))
        .rejects.toThrow('Validation failed: preferred_language: Preferred language must be a valid ISO 639-1 code')
    })

    it('should reject invalid avatar URL', async () => {
      const invalidData = {
        ...validUserData,
        avatar_url: 'not-a-valid-url'
      }

      await expect(UserService.createUser(invalidData))
        .rejects.toThrow('Validation failed: avatar_url: Invalid avatar URL format')
    })
  })

  describe('updateUser', () => {
    const validUpdateData: UpdateUserData = {
      username: 'updateduser',
      display_name: 'Updated User'
    }

    it('should update user with valid data', async () => {
      const result = await UserService.updateUser('test-user-id', validUpdateData)
      expect(result).toBeDefined()
    })

    it('should reject malicious content in username update', async () => {
      const maliciousData = {
        username: '<script>alert("xss")</script>malicious'
      }

      await expect(UserService.updateUser('test-user-id', maliciousData))
        .rejects.toThrow('Validation failed: username: Input contains potentially dangerous content')
    })

    it('should reject malicious content in display name update', async () => {
      const maliciousData = {
        display_name: '<script>alert("xss")</script>Malicious Name'
      }

      await expect(UserService.updateUser('test-user-id', maliciousData))
        .rejects.toThrow('Validation failed: display_name: Input contains potentially dangerous content')
    })

    it('should reject invalid user ID', async () => {
      await expect(UserService.updateUser('', validUpdateData))
        .rejects.toThrow('Valid user ID is required')
    })

    it('should reject invalid preferred language update', async () => {
      const invalidData = {
        preferred_language: 'invalid'
      }

      await expect(UserService.updateUser('test-user-id', invalidData))
        .rejects.toThrow('Validation failed: preferred_language: Preferred language must be a valid ISO 639-1 code')
    })
  })

  describe('isUsernameAvailable', () => {
    it('should validate username format', async () => {
      await expect(UserService.isUsernameAvailable('<script>alert("xss")</script>'))
        .rejects.toThrow('Invalid username format: Input contains potentially dangerous content')
    })

    it('should reject empty username', async () => {
      await expect(UserService.isUsernameAvailable(''))
        .rejects.toThrow('Valid username is required')
    })

    it('should reject short username', async () => {
      await expect(UserService.isUsernameAvailable('ab'))
        .rejects.toThrow('Invalid username format: Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens')
    })
  })

  describe('getUserByUsername', () => {
    it('should validate username format', async () => {
      await expect(UserService.getUserByUsername('<script>alert("xss")</script>'))
        .rejects.toThrow('Invalid username format: Input contains potentially dangerous content')
    })

    it('should reject empty username', async () => {
      await expect(UserService.getUserByUsername(''))
        .rejects.toThrow('Valid username is required')
    })
  })

  describe('updatePreferredLanguage', () => {
    it('should validate language code format', async () => {
      await expect(UserService.updatePreferredLanguage('test-user-id', 'invalid'))
        .rejects.toThrow('Language must be a valid ISO 639-1 code')
    })

    it('should reject empty language', async () => {
      await expect(UserService.updatePreferredLanguage('test-user-id', ''))
        .rejects.toThrow('Valid language is required')
    })

    it('should reject empty user ID', async () => {
      await expect(UserService.updatePreferredLanguage('', 'en'))
        .rejects.toThrow('Valid user ID is required')
    })
  })

  describe('updateAvatarUrl', () => {
    it('should validate URL format', async () => {
      await expect(UserService.updateAvatarUrl('test-user-id', 'not-a-valid-url'))
        .rejects.toThrow('Invalid avatar URL format')
    })

    it('should reject empty URL', async () => {
      await expect(UserService.updateAvatarUrl('test-user-id', ''))
        .rejects.toThrow('Valid avatar URL is required')
    })

    it('should reject empty user ID', async () => {
      await expect(UserService.updateAvatarUrl('', 'https://example.com/avatar.jpg'))
        .rejects.toThrow('Valid user ID is required')
    })
  })

  describe('getOrCreateUser', () => {
    it('should reject empty user ID', async () => {
      await expect(UserService.getOrCreateUser(''))
        .rejects.toThrow('Valid user ID is required')
    })

    it('should accept valid user ID', async () => {
      const result = await UserService.getOrCreateUser('test-user-id')
      expect(result).toBeDefined()
    })
  })
}) 