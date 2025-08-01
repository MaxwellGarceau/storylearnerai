import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/api/supabase/client'

interface TestSupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

/**
 * Creates a Supabase client for testing purposes
 * This client can be configured with different URLs and keys for different test environments
 */
function createTestSupabaseClient(config: TestSupabaseConfig): SupabaseClient<Database> {
  if (!config.url || !config.anonKey) {
    throw new Error('Missing Supabase test configuration. Please check your test environment variables.')
  }

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

/**
 * Creates a Supabase client with service role key for admin operations
 * Use this for setup/teardown operations that require elevated privileges
 */
function createTestSupabaseAdminClient(config: TestSupabaseConfig): SupabaseClient<Database> {
  if (!config.url || !config.serviceRoleKey) {
    throw new Error('Missing Supabase service role key for admin operations.')
  }

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

/**
 * Default test configuration using environment variables
 */
const getDefaultTestConfig = (): TestSupabaseConfig => ({
  url: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
  anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
})

/**
 * Creates a default test client using environment variables
 */
export const createDefaultTestClient = () => createTestSupabaseClient(getDefaultTestConfig())

/**
 * Creates a default test admin client using environment variables
 */
export const createDefaultTestAdminClient = () => createTestSupabaseAdminClient(getDefaultTestConfig()) 