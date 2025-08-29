#!/usr/bin/env node
/* eslint-env node */

/**
 * Script to create sample saved translations for the test user
 * Migrates the 3 sample stories from the old stories table to saved_translations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user ID (you can update this to match your test user)
const testUserId = '3675a4dd-ab91-42a0-8b8c-40c5323b47d0';

// Sample stories data (migrated from old stories table)
const sampleStories = [
  {
    title: 'The Little Red Hen',
    originalStory: 'Once upon a time, there was a little red hen who lived on a farm. She found some wheat seeds and decided to plant them. She asked her friends, the cat, the dog, and the pig, "Who will help me plant these seeds?" But they all said, "Not I!" So the little red hen planted the seeds herself.',
    translatedStory: 'Érase una vez una pequeña gallina roja que vivía en una granja. Encontró algunas semillas de trigo y decidió plantarlas. Preguntó a sus amigos, el gato, el perro y el cerdo: "¿Quién me ayudará a plantar estas semillas?" Pero todos dijeron: "¡Yo no!" Así que la pequeña gallina roja plantó las semillas ella misma.',
    difficultyLevel: 'a1'
  },
  {
    title: 'The Three Little Pigs',
    originalStory: 'Once there were three little pigs who set out to seek their fortune. The first pig built his house of straw, the second built his house of sticks, and the third built his house of bricks. When the big bad wolf came, only the house of bricks stood strong.',
    translatedStory: 'Érase una vez tres cerditos que salieron a buscar fortuna. El primer cerdito construyó su casa de paja, el segundo construyó su casa de palos, y el tercero construyó su casa de ladrillos. Cuando llegó el lobo feroz, solo la casa de ladrillos se mantuvo firme.',
    difficultyLevel: 'a1'
  },
  {
    title: 'The Tortoise and the Hare',
    originalStory: 'A hare was boasting about how fast he could run. He laughed at the tortoise for being so slow. The tortoise challenged the hare to a race. The hare ran fast but stopped to rest, thinking he had plenty of time. The tortoise kept going slowly and steadily, and won the race.',
    translatedStory: 'Una liebre se jactaba de lo rápido que podía correr. Se rió de la tortuga por ser tan lenta. La tortuga desafió a la liebre a una carrera. La liebre corrió rápido pero se detuvo a descansar, pensando que tenía mucho tiempo. La tortuga siguió avanzando lenta y constantemente, y ganó la carrera.',
    difficultyLevel: 'a2'
  }
];

async function createSampleSavedTranslations() {
  try {
    console.log('Creating sample saved translations...');
    console.log(`User ID: ${testUserId}`);
    console.log('');

    // Get language and difficulty level IDs
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('id, code');

    if (langError) {
      console.error('Error fetching languages:', langError.message);
      return;
    }

    const { data: difficultyLevels, error: diffError } = await supabase
      .from('difficulty_levels')
      .select('id, code');

    if (diffError) {
      console.error('Error fetching difficulty levels:', diffError.message);
      return;
    }

    const englishLangId = languages.find(l => l.code === 'en')?.id;
    const spanishLangId = languages.find(l => l.code === 'es')?.id;

    if (!englishLangId || !spanishLangId) {
      console.error('Could not find English or Spanish language IDs');
      return;
    }

    // Create saved translations for each sample story
    for (const story of sampleStories) {
      const difficultyLevelId = difficultyLevels.find(d => d.code === story.difficultyLevel)?.id;
      
      if (!difficultyLevelId) {
        console.error(`Could not find difficulty level ID for ${story.difficultyLevel}`);
        continue;
      }

      const { data, error } = await supabase
        .from('saved_translations')
        .insert({
          user_id: testUserId,
          original_story: story.originalStory,
          translated_story: story.translatedStory,
          original_language_id: englishLangId,
          translated_language_id: spanishLangId,
          difficulty_level_id: difficultyLevelId,
          title: story.title,
          notes: 'Sample story migrated from old stories table'
        })
        .select();

      if (error) {
        console.error(`Error creating saved translation for "${story.title}":`, error.message);
      } else {
        console.log(`✅ Created saved translation: "${story.title}" (ID: ${data[0].id})`);
      }
    }

    console.log('');
    console.log('🎉 Sample saved translations created successfully!');
    console.log('You can now view these in the saved translations section of the app.');
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
createSampleSavedTranslations();
