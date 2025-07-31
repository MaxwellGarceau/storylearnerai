import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserService, CreateUserData, UpdateUserData } from '../userService'
import { supabase } from '../../client'

// Mock Supabase client
vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}))

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Input Validation and Sanitization', () => {
    describe('createUser', () => {
      it('should create user with valid data', async () => {
        const mockUser = {
          id: 'user123',
          username: 'testuser',
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          preferred_language: 'en',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null
              })
            })
          })
        })

        const userData: CreateUserData = {
          id: 'user123',
          username: 'testuser',
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          preferred_language: 'en'
        }

        const result = await UserService.createUser(userData)

        expect(result).toEqual(mockUser)
        expect(mockSupabase.from).toHaveBeenCalledWith('users')
      })

      it('should reject invalid user ID', async () => {
        const userData: CreateUserData = {
          id: '',
          username: 'testuser'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: id: User ID is required and must be a string')
      })

      it('should reject malicious username', async () => {
        const userData: CreateUserData = {
          id: 'user123',
          username: '<script>alert("xss")</script>malicious'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: username: Input contains potentially dangerous content')
      })

      it('should reject invalid username format', async () => {
        const userData: CreateUserData = {
          id: 'user123',
          username: 'ab' // Too short
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: username: Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens')
      })

      it('should reject malicious display name', async () => {
        const userData: CreateUserData = {
          id: 'user123',
          display_name: '<img src="x" onerror="alert(\'xss\')">Malicious'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: display_name: Input contains potentially dangerous content')
      })

      it('should reject invalid avatar URL', async () => {
        const userData: CreateUserData = {
          id: 'user123',
          avatar_url: 'not-a-valid-url'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: avatar_url: Invalid URL format')
      })

      it('should reject invalid language code', async () => {
        const userData: CreateUserData = {
          id: 'user123',
          preferred_language: 'invalid'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation failed: preferred_language: Invalid language code format (use ISO 639-1)')
      })

      it('should handle null/empty optional fields', async () => {
        const mockUser = {
          id: 'user123',
          username: null,
          display_name: null,
          avatar_url: null,
          preferred_language: 'en',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null
              })
            })
          })
        })

        const userData: CreateUserData = {
          id: 'user123',
          username: null,
          display_name: null,
          avatar_url: null
        }

        const result = await UserService.createUser(userData)

        expect(result).toEqual(mockUser)
      })
    })

    describe('updateUser', () => {
      it('should update user with valid data', async () => {
        const mockUser = {
          id: 'user123',
          username: 'updateduser',
          display_name: 'Updated User',
          avatar_url: 'https://example.com/new-avatar.jpg',
          preferred_language: 'es',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUser,
                  error: null
                })
              })
            })
          })
        })

        const updateData: UpdateUserData = {
          username: 'updateduser',
          display_name: 'Updated User',
          avatar_url: 'https://example.com/new-avatar.jpg',
          preferred_language: 'es'
        }

        const result = await UserService.updateUser('user123', updateData)

        expect(result).toEqual(mockUser)
      })

      it('should reject invalid user ID', async () => {
        const updateData: UpdateUserData = {
          username: 'newuser'
        }

        await expect(UserService.updateUser('', updateData)).rejects.toThrow('Invalid user ID provided')
      })

      it('should reject malicious username update', async () => {
        const updateData: UpdateUserData = {
          username: 'javascript:alert("xss")'
        }

        await expect(UserService.updateUser('user123', updateData)).rejects.toThrow('Validation failed: username: Input contains potentially dangerous content')
      })

      it('should handle setting fields to null', async () => {
        const mockUser = {
          id: 'user123',
          username: null,
          display_name: null,
          avatar_url: null,
          preferred_language: 'en',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUser,
                  error: null
                })
              })
            })
          })
        })

        const updateData: UpdateUserData = {
          username: null,
          display_name: null,
          avatar_url: null
        }

        const result = await UserService.updateUser('user123', updateData)

        expect(result).toEqual(mockUser)
      })
    })

    describe('getUser', () => {
      it('should reject invalid user ID', async () => {
        await expect(UserService.getUser('')).rejects.toThrow('Invalid user ID provided')
      })

      it('should reject non-string user ID', async () => {
        await expect(UserService.getUser(null as any)).rejects.toThrow('Invalid user ID provided')
      })
    })

    describe('deleteUser', () => {
      it('should reject invalid user ID', async () => {
        await expect(UserService.deleteUser('')).rejects.toThrow('Invalid user ID provided')
      })
    })

    describe('isUsernameAvailable', () => {
      it('should reject invalid username format', async () => {
        await expect(UserService.isUsernameAvailable('<script>alert("xss")</script>')).rejects.toThrow('Invalid username format: Input contains potentially dangerous content')
      })

      it('should reject username that is too short', async () => {
        await expect(UserService.isUsernameAvailable('ab')).rejects.toThrow('Invalid username format: Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens')
      })

      it('should return true for available username', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })

        const result = await UserService.isUsernameAvailable('availableuser')
        expect(result).toBe(true)
      })

      it('should return false for taken username', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existinguser' },
                error: null
              })
            })
          })
        })

        const result = await UserService.isUsernameAvailable('takenuser')
        expect(result).toBe(false)
      })
    })

    describe('getUserByUsername', () => {
      it('should reject invalid username format', async () => {
        await expect(UserService.getUserByUsername('javascript:alert("xss")')).rejects.toThrow('Invalid username format: Input contains potentially dangerous content')
      })

      it('should return user for valid username', async () => {
        const mockUser = {
          id: 'user123',
          username: 'testuser',
          display_name: 'Test User',
          avatar_url: null,
          preferred_language: 'en',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null
              })
            })
          })
        })

        const result = await UserService.getUserByUsername('testuser')
        expect(result).toEqual(mockUser)
      })
    })
  })

  describe('Business Logic Validation', () => {
    describe('Username Uniqueness', () => {
      it('should reject creation with taken username', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existinguser' },
                error: null
              })
            })
          })
        })

        const userData: CreateUserData = {
          id: 'user123',
          username: 'takenuser'
        }

        await expect(UserService.createUser(userData)).rejects.toThrow('Username is already taken')
      })

      it('should reject update with taken username', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existinguser' },
                error: null
              })
            })
          })
        })

        const updateData: UpdateUserData = {
          username: 'takenuser'
        }

        await expect(UserService.updateUser('user123', updateData)).rejects.toThrow('Username is already taken')
      })
    })
  })

  describe('Error Handling', () => {
         it('should handle database errors gracefully', async () => {
       const mockSupabase = supabase as any
       mockSupabase.from.mockReturnValue({
         select: vi.fn().mockReturnValue({
           eq: vi.fn().mockReturnValue({
             single: vi.fn().mockResolvedValue({
               data: null,
               error: { code: 'PGRST116' }
             })
           })
         }),
         insert: vi.fn().mockReturnValue({
           select: vi.fn().mockReturnValue({
             single: vi.fn().mockResolvedValue({
               data: null,
               error: { message: 'Database connection failed' }
             })
           })
         })
       })

       const userData: CreateUserData = {
         id: 'user123',
         username: 'testuser'
       }

       await expect(UserService.createUser(userData)).rejects.toThrow('Failed to create user: Database connection failed')
     })

    it('should handle user not found errors', async () => {
      const mockSupabase = supabase as any
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })

      const result = await UserService.getUser('nonexistent')
      expect(result).toBeNull()
    })
  })
}) 