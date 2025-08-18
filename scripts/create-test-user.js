#!/usr/bin/env node
/* eslint-env node */

/**
 * Script to create a test user for local development
 * Uses Supabase Admin API to create a valid user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logger } from '../src/lib/logger/index.js'

// Load environment variables
dotenv.config()

// Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  logger.warn('config', 'Warning: Using fallback values. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.')
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test user details
const testUser = {
  email: 'maxwellgarceau@gmail.com',
  password: 'TestPass123!', // Meets all requirements: 8+ chars, upper, lower, number, special
  user_metadata: {
    username: 'maxwellgarceau',
    display_name: 'Maxwell Garceau'
  }
}

async function createTestUser() {
  try {
    logger.info('setup', 'Creating test user...')
    logger.info('setup', `Email: ${testUser.email}`)
    logger.info('setup', `Password: ${testUser.password}`)
    logger.info('setup', '')

    // Create user using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm email for local development
      user_metadata: testUser.user_metadata
    })

    if (error) {
      logger.error('setup', 'Error creating user', { error: error.message })
      process.exit(1)
    }

    const userId = data.user.id
    logger.info('setup', '✅ User created successfully!')
    logger.info('setup', `User ID: ${userId}`)
    logger.info('setup', '')

    logger.info('setup', '🎉 Setup complete!')
    logger.info('setup', 'You can now log in with:')
    logger.info('setup', `Email: ${testUser.email}`)
    logger.info('setup', `Password: ${testUser.password}`)
    logger.info('setup', '')
    logger.info('setup', 'The user profile will be created automatically by the database trigger.')

  } catch (error) {
    logger.error('setup', 'Unexpected error', { error: error.message })
    process.exit(1)
  }
}

// Run the script
createTestUser() 