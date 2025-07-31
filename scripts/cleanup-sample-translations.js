#!/usr/bin/env node

/**
 * Script to clean up sample saved translations from the database
 * Removes any pre-generated translations that users didn't create themselves
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

// Sample translation titles that were created by the test script
const sampleTranslationTitles = [
  'La Gallinita Roja',
  'Los Tres Cerditos', 
  'La Tortuga y la Liebre',
  'El León y el Ratón',
  'El Principito'
]

async function cleanupSampleTranslations() {
  try {
    console.log('🧹 Cleaning up sample saved translations...')
    console.log('')

    // Get all saved translations
    const { data: translations, error } = await supabase
      .from('saved_translations')
      .select('id, title, user_id, created_at')

    if (error) {
      throw new Error(`Failed to fetch saved translations: ${error.message}`)
    }

    console.log(`Found ${translations.length} total saved translations`)

    // Find sample translations to remove
    const sampleTranslations = translations.filter(translation => 
      sampleTranslationTitles.includes(translation.title)
    )

    if (sampleTranslations.length === 0) {
      console.log('✅ No sample translations found to clean up.')
      return
    }

    console.log(`Found ${sampleTranslations.length} sample translations to remove:`)
    sampleTranslations.forEach(translation => {
      console.log(`  - ${translation.title} (ID: ${translation.id})`)
    })
    console.log('')

    // Delete sample translations
    const sampleIds = sampleTranslations.map(t => t.id)
    const { error: deleteError } = await supabase
      .from('saved_translations')
      .delete()
      .in('id', sampleIds)

    if (deleteError) {
      throw new Error(`Failed to delete sample translations: ${deleteError.message}`)
    }

    console.log('✅ Successfully removed sample translations!')
    console.log(`Removed ${sampleTranslations.length} sample translations`)
    console.log('')

    // Show remaining translations
    const { data: remainingTranslations, error: remainingError } = await supabase
      .from('saved_translations')
      .select('id, title, user_id, created_at')

    if (remainingError) {
      throw new Error(`Failed to fetch remaining translations: ${remainingError.message}`)
    }

    console.log(`Remaining saved translations: ${remainingTranslations.length}`)
    if (remainingTranslations.length > 0) {
      console.log('Remaining translations:')
      remainingTranslations.forEach(translation => {
        console.log(`  - ${translation.title} (ID: ${translation.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
    process.exit(1)
  }
}

// Run the script
cleanupSampleTranslations() 