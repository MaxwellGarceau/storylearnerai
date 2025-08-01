import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import { createTestDatabase } from './test-database'

const execAsync = promisify(exec)

// Global test database instance
let testDatabase: ReturnType<typeof createTestDatabase>

/**
 * Starts the Supabase test instance
 */
async function startSupabaseTest(): Promise<void> {
  try {
    console.log('Starting Supabase test instance...')
    
    // Stop any existing test instance
    await execAsync('supabase stop')
  } catch {
    // Ignore errors if no instance was running
  }

  try {
    // Start the test instance
    await execAsync('supabase start')
    console.log('Supabase test instance started successfully')
  } catch (error) {
    console.error('Failed to start Supabase test instance:', error)
    throw error
  }
}

/**
 * Stops the Supabase test instance
 */
async function stopSupabaseTest(): Promise<void> {
  try {
    console.log('Stopping Supabase test instance...')
    await execAsync('supabase stop')
    console.log('Supabase test instance stopped successfully')
  } catch (error) {
    console.error('Failed to stop Supabase test instance:', error)
  }
}

/**
 * Global test setup - runs once before all tests
 */
beforeAll(async () => {
  // Start Supabase test instance
  await startSupabaseTest()
  
  // Create test database instance
  testDatabase = createTestDatabase()
  
  // Wait a moment for the database to be ready
  await new Promise(resolve => setTimeout(resolve, 2000))
}, 60000) // 60 second timeout

/**
 * Global test teardown - runs once after all tests
 */
afterAll(async () => {
  // Stop Supabase test instance
  await stopSupabaseTest()
}, 30000) // 30 second timeout

/**
 * Before each test - clean the database
 */
beforeEach(async () => {
  if (testDatabase) {
    await testDatabase.clearAllData()
  }
}, 10000) // 10 second timeout

/**
 * After each test - clean up any remaining data
 */
afterEach(async () => {
  if (testDatabase) {
    await testDatabase.clearAllData()
  }
}, 5000) // 5 second timeout

/**
 * Export the test database instance for use in tests
 */


/**
 * Helper function to get the test database instance
 */
export function getTestDatabase() {
  if (!testDatabase) {
    throw new Error('Test database not initialized. Make sure you are running tests with the proper setup.')
  }
  return testDatabase
} 