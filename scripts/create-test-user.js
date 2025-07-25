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

// Sample saved translations (all Spanish -> English)
const sampleTranslations = [
  {
    title: 'La Gallinita Roja',
    original_story: 'Érase una vez una gallinita roja que vivía en una granja. Encontró algunas semillas de trigo y decidió plantarlas. Preguntó a sus amigos, el gato, el perro y el cerdo: "¿Quién me ayudará a plantar estas semillas?" Pero todos dijeron: "¡Yo no!" Así que la gallinita roja plantó las semillas ella misma.',
    translated_story: 'Once upon a time, there was a little red hen who lived on a farm. She found some wheat seeds and decided to plant them. She asked her friends, the cat, the dog, and the pig: "Who will help me plant these seeds?" But they all said: "Not I!" So the little red hen planted the seeds herself.',
    original_language_code: 'es',
    translated_language_code: 'en',
    difficulty_level_code: 'a1',
    notes: 'A simple story about cooperation and hard work. Perfect for beginners learning Spanish.'
  },
  {
    title: 'Los Tres Cerditos',
    original_story: 'Érase una vez tres cerditos que salieron a buscar fortuna. El primer cerdito construyó su casa de paja, el segundo construyó su casa de palos, y el tercero construyó su casa de ladrillos. Cuando llegó el lobo feroz, solo la casa de ladrillos se mantuvo firme.',
    translated_story: 'Once upon a time, there were three little pigs who set out to seek their fortune. The first pig built his house of straw, the second built his house of sticks, and the third built his house of bricks. When the big bad wolf came, only the house of bricks stood strong.',
    original_language_code: 'es',
    translated_language_code: 'en',
    difficulty_level_code: 'a1',
    notes: 'Classic tale about preparation and planning. Good for building basic vocabulary.'
  },
  {
    title: 'La Tortuga y la Liebre',
    original_story: 'Una liebre se jactaba de lo rápido que podía correr. Se reía de la tortuga por ser tan lenta. La tortuga desafió a la liebre a una carrera. La liebre corrió rápido pero se detuvo a descansar, pensando que tenía mucho tiempo. La tortuga siguió avanzando lenta y constantemente, y ganó la carrera.',
    translated_story: 'A hare was boasting about how fast he could run. He laughed at the tortoise for being so slow. The tortoise challenged the hare to a race. The hare ran fast but stopped to rest, thinking he had plenty of time. The tortoise kept going slowly and steadily, and won the race.',
    original_language_code: 'es',
    translated_language_code: 'en',
    difficulty_level_code: 'a2',
    notes: 'Fable about persistence and overconfidence. Introduces more complex sentence structures.'
  },
  {
    title: 'El León y el Ratón',
    original_story: 'Un león dormía tranquilamente en la selva cuando un pequeño ratón comenzó a correr sobre su cuerpo. El león se despertó enfadado y estaba a punto de comerse al ratón. El ratón le suplicó: "Por favor, no me comas. Algún día podré ayudarte." El león se rió pero dejó ir al ratón. Más tarde, el león quedó atrapado en una red de cazadores. El ratón oyó sus rugidos y corrió a morder las cuerdas de la red, liberando al león.',
    translated_story: 'A lion was sleeping peacefully in the jungle when a small mouse began running over his body. The lion woke up angry and was about to eat the mouse. The mouse begged: "Please, don\'t eat me. Someday I might be able to help you." The lion laughed but let the mouse go. Later, the lion got caught in a hunter\'s net. The mouse heard his roars and ran to bite the ropes of the net, freeing the lion.',
    original_language_code: 'es',
    translated_language_code: 'en',
    difficulty_level_code: 'b1',
    notes: 'Moral story about kindness and how even small creatures can help. Uses intermediate vocabulary and grammar.'
  },
  {
    title: 'El Principito',
    original_story: 'En un planeta muy pequeño, vivía un príncipe que cuidaba de una rosa muy especial. La rosa era hermosa pero también muy orgullosa. Un día, el príncipe decidió viajar por el universo para entender mejor el amor y la amistad. En su viaje, conoció a muchas personas extrañas y aprendió que lo esencial es invisible a los ojos.',
    translated_story: 'On a very small planet, there lived a prince who took care of a very special rose. The rose was beautiful but also very proud. One day, the prince decided to travel through the universe to better understand love and friendship. On his journey, he met many strange people and learned that what is essential is invisible to the eye.',
    original_language_code: 'es',
    translated_language_code: 'en',
    difficulty_level_code: 'b2',
    notes: 'Excerpt from The Little Prince. Uses more sophisticated language and abstract concepts.'
  }
]

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

    // Create sample saved translations
    console.log('Creating sample saved translations...')
    for (const translation of sampleTranslations) {
      await createSavedTranslation(userId, translation)
      console.log(`✅ Created: ${translation.title} (${translation.difficulty_level_code.toUpperCase()})`)
    }

    console.log('')
    console.log('🎉 Setup complete!')
    console.log('You can now log in with:')
    console.log(`Email: ${testUser.email}`)
    console.log(`Password: ${testUser.password}`)
    console.log('')
    console.log('The user profile will be created automatically by the database trigger.')
    console.log(`Created ${sampleTranslations.length} sample saved translations for testing.`)

  } catch (error) {
    console.error('Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the script
createTestUser() 