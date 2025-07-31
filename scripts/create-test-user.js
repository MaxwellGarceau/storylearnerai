#!/usr/bin/env node

/**
 * Script to create a test user and sample saved translations for local development
 * Uses Supabase Admin API to create a valid user and sample data
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Validate required environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Warning: Using fallback values. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.')
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

// Sample saved translations removed - users should create their own translations
const sampleTranslations = []

async function getLanguageId(code) {
  const { data, error } = await supabase
    .from('languages')
    .select('id')
    .eq('code', code)
    .single()

  if (error) {
    throw new Error(`Failed to get language ID for code ${code}: ${error.message}`)
  }
  return data.id
}

async function getDifficultyLevelId(code) {
  const { data, error } = await supabase
    .from('difficulty_levels')
    .select('id')
    .eq('code', code)
    .single()

  if (error) {
    throw new Error(`Failed to get difficulty level ID for code ${code}: ${error.message}`)
  }
  return data.id
}

async function createSavedTranslation(userId, translation) {
  const [originalLanguageId, translatedLanguageId, difficultyLevelId] = await Promise.all([
    getLanguageId(translation.original_language_code),
    getLanguageId(translation.translated_language_code),
    getDifficultyLevelId(translation.difficulty_level_code)
  ])

  const { data, error } = await supabase
    .from('saved_translations')
    .insert({
      user_id: userId,
      original_story: translation.original_story,
      translated_story: translation.translated_story,
      original_language_id: originalLanguageId,
      translated_language_id: translatedLanguageId,
      difficulty_level_id: difficultyLevelId,
      title: translation.title,
      notes: translation.notes
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create saved translation: ${error.message}`)
  }
  return data
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

    const userId = data.user.id
    console.log('✅ User created successfully!')
    console.log('User ID:', userId)
    console.log('')

    console.log('🎉 Setup complete!')
    console.log('You can now log in with:')
    console.log(`Email: ${testUser.email}`)
    console.log(`Password: ${testUser.password}`)
    console.log('')
    console.log('The user profile will be created automatically by the database trigger.')
    console.log('No sample translations created - users should create their own translations.')

  } catch (error) {
    console.error('Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the script
createTestUser() 