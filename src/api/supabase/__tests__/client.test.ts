import { describe, it, expect } from 'vitest'
import { supabase } from '../client'

// Basic structural tests to ensure client is exported and usable
// Environment validation is handled at module init and covered indirectly

describe('Supabase Client', () => {
  it('should export a supabase client instance', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase).toBe('object')
  })

  it('should have expected Supabase client methods', () => {
    expect(supabase.auth).toBeDefined()
    expect(typeof supabase.auth).toBe('object')

    expect(supabase.from).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('should be able to call from method', () => {
    const tableQuery = supabase.from('test_table')
    expect(tableQuery).toBeDefined()
    expect(typeof tableQuery).toBe('object')
  })
})
