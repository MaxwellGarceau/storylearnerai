#!/bin/bash

# Post-database reset script for StoryLearnerAI
# This script runs after supabase db reset to set up development environment

set -e  # Exit on any error

echo "🚀 Running post-database reset setup..."

# Check if we're in development mode
if [ "$NODE_ENV" = "production" ]; then
    echo "⚠️  Skipping test user creation in production environment"
    exit 0
fi

# Check if the create-test-user script exists
if [ ! -f "scripts/create-test-user.js" ]; then
    echo "❌ create-test-user.js script not found"
    exit 1
fi

# Wait a moment for Supabase to fully start
echo "⏳ Waiting for Supabase to be ready..."
sleep 3

# Run the test user creation script
echo "👤 Creating test user..."
node scripts/create-test-user.js

echo "✅ Post-database reset setup complete!"
