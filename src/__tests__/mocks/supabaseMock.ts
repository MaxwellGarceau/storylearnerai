import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { User } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        maybeSingle: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
}

// Mock useAuth hook
export const mockUseAuth = vi.fn(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  user: null as User | null,
  loading: false,
  error: null as string | null,
}))

// MSW handlers for Supabase REST API
const supabaseHandlers = [
  // Auth endpoints
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    })
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    })
  }),

  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({})
  }),

  http.post('*/auth/v1/recover', () => {
    return HttpResponse.json({})
  }),

  // Database endpoints
  http.get('*/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        username: 'testuser',
        display_name: 'Test User',
        preferred_language: 'en',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ])
  }),

  http.post('*/rest/v1/users', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      username: 'testuser',
      display_name: 'Test User',
      preferred_language: 'en',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }, { status: 201 })
  }),

  http.patch('*/rest/v1/users', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      username: 'updateduser',
      display_name: 'Updated User',
      preferred_language: 'en',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    })
  }),
]

// MSW handlers for Llama service
const llamaHandlers = [
  http.post('https://api.groq.com/openai/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: 'Hello! How can I help you today?',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      },
      model: 'llama3-8b-8192',
    })
  }),

  http.post('http://localhost:11434/api/chat', () => {
    return HttpResponse.json({
      message: {
        content: 'Hello! How can I help you today?',
      },
      model: 'llama3.1:8b',
      prompt_eval_count: 10,
      eval_count: 15,
    })
  }),

  http.post('http://localhost:11434/api/tags', () => {
    return HttpResponse.json({
      models: [{ name: 'llama3.1:8b' }],
    })
  }),

  http.post('https://api.together.xyz/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: 'Hello! How can I help you today?',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      },
      model: 'meta-llama/Llama-2-7b-chat-hf',
    })
  }),

  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.json({
      output: ['Hello! How can I help you today?'],
      status: 'succeeded',
    })
  }),
]

// Setup MSW server
export const server = setupServer(...supabaseHandlers, ...llamaHandlers)

// Mock the useAuth hook globally
export const setupSupabaseMocks = () => {
  // Mock the useAuth hook
  vi.mock('../../hooks/useAuth', () => ({
    useAuth: mockUseAuth,
  }))

  // Mock the Supabase client
  vi.mock('../../api/supabase/client', () => ({
    supabase: mockSupabaseClient,
  }))

  // Mock the UserService
  vi.mock('../../api/supabase', () => ({
    UserService: {
      getOrCreateUser: vi.fn(),
      updateUser: vi.fn(),
      isUsernameAvailable: vi.fn(),
    },
  }))
}