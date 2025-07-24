#!/usr/bin/env node

/**
 * Script to create a test user for local development
 * Uses Supabase Admin API to create a valid user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

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
    console.log('Creating test user...')
    console.log(`Email: ${testUser.email}`)
    console.log(`Password: ${testUser.password}`)
    console.log('')

    // Create user using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm email for local development
      user_metadata: testUser.user_metadata
    })

    if (error) {
      console.error('Error creating user:', error.message)
      process.exit(1)
    }

    console.log('✅ User created successfully!')
    console.log('User ID:', data.user.id)
    console.log('')
    console.log('You can now log in with:')
    console.log(`Email: ${testUser.email}`)
    console.log(`Password: ${testUser.password}`)
    console.log('')
    console.log('The user profile will be created automatically by the database trigger.')

  } catch (error) {
    console.error('Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the script
createTestUser() 