#!/usr/bin/env node
/* eslint-env node */

/**
 * Script to create a test user for local development
 * Uses Supabase Admin API to create a valid user
 * 
 * SECURITY NOTE: This script should only be used in development environments.
 * Never run this in production or commit real credentials to version control.
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

// Test user details - Use environment variables for security
const testUser = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!', // Meets all requirements: 8+ chars, upper, lower, number, special
  user_metadata: {
    username: process.env.TEST_USER_USERNAME || 'testuser',
    display_name: process.env.TEST_USER_DISPLAY_NAME || 'Test User',
  },
};

// Validate required environment variables
if (
  !process.env.VITE_SUPABASE_URL ||
  !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
) {
  console.warn(
    'Warning: Using fallback values. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.'
  );
}

// Security check - prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script should not be run in production!');
  console.error('This script is for development purposes only.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('🔐 Creating test user for development...');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`👤 Username: ${testUser.user_metadata.username}`);
    console.log(`📝 Display Name: ${testUser.user_metadata.display_name}`);
    console.log('');

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === testUser.email);
    
    if (userExists) {
      console.log('⚠️  User already exists!');
      console.log('You can log in with:');
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: ${testUser.password}`);
      return;
    }

    // Create user using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm email for local development
      user_metadata: testUser.user_metadata,
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }

    const userId = data.user.id;
    console.log('✅ User created successfully!');
    console.log(`🆔 User ID: ${userId}`);
    console.log('');

    console.log('🎉 Setup complete!');
    console.log('You can now log in with:');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Password: ${testUser.password}`);
    console.log('');
    console.log(
      'The user profile will be created automatically by the database trigger.'
    );
    console.log('');
    console.log('💡 Tip: You can customize the test user by setting these environment variables:');
    console.log('   TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_USERNAME, TEST_USER_DISPLAY_NAME');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
createTestUser();
