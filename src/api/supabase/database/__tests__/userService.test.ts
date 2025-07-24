import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserService } from '../userService'
import { supabase } from '../../client'

// Mock the supabase client
vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockedSupabase = vi.mocked(supabase)

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        preferred_language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.getUser('user-1')

      expect(result).toEqual(mockUser)
      expect(mockedSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'user-1')
      expect(mockQuery.single).toHaveBeenCalled()
    })

    it('should return null when user not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.getUser('user-1')

      expect(result).toBeNull()
    })

    it('should throw error on database error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      await expect(UserService.getUser('user-1')).rejects.toThrow('Failed to fetch user: Database error')
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        preferred_language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.createUser({
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        preferred_language: 'en'
      })

      expect(result).toEqual(mockUser)
      expect(mockedSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: undefined,
        preferred_language: 'en',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })

    it('should throw error on creation failure', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Creation failed' }
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      await expect(UserService.createUser({
        id: 'user-1',
        username: 'testuser'
      })).rejects.toThrow('Failed to create user: Creation failed')
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'updateduser',
        display_name: 'Updated User',
        avatar_url: null,
        preferred_language: 'es',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.updateUser('user-1', {
        username: 'updateduser',
        display_name: 'Updated User',
        preferred_language: 'es'
      })

      expect(result).toEqual(mockUser)
      expect(mockedSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.update).toHaveBeenCalledWith({
        username: 'updateduser',
        display_name: 'Updated User',
        preferred_language: 'es',
        updated_at: expect.any(String)
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'user-1')
    })
  })

  describe('isUsernameAvailable', () => {
    it('should return true when username is available', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.isUsernameAvailable('newuser')

      expect(result).toBe(true)
      expect(mockedSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.select).toHaveBeenCalledWith('id')
      expect(mockQuery.eq).toHaveBeenCalledWith('username', 'newuser')
    })

    it('should return false when username is taken', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-1' },
          error: null
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.isUsernameAvailable('existinguser')

      expect(result).toBe(false)
    })
  })

  describe('getOrCreateUser', () => {
    it('should return existing user when found', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        preferred_language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockedSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.getOrCreateUser('user-1')

      expect(result).toEqual(mockUser)
      expect(mockedSupabase.from).toHaveBeenCalledTimes(1) // Only getUser called
    })

    it('should create new user when not found', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: null,
        preferred_language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // First call returns null (user not found)
      const mockGetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      // Second call creates user
      const mockCreateQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      }

      mockedSupabase.from
        .mockReturnValueOnce(mockGetQuery as jest.Mocked<typeof mockQuery>)
        .mockReturnValueOnce(mockCreateQuery as jest.Mocked<typeof mockQuery>)

      const result = await UserService.getOrCreateUser('user-1', {
        username: 'testuser',
        display_name: 'Test User'
      })

      expect(result).toEqual(mockUser)
      expect(mockedSupabase.from).toHaveBeenCalledTimes(2) // Both get and create called
    })
  })
}) 