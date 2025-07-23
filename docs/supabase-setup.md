# Supabase Setup and Configuration

This document provides a comprehensive guide to setting up and using Supabase in the StoryLearnerAI project.

## Overview

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database**: Full-featured relational database
- **Authentication**: Built-in user management
- **Real-time Subscriptions**: Live data updates
- **Storage**: File upload and management
- **Edge Functions**: Serverless functions

## Initial Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `storylearnerai`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Environment Variables

Add these to your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Schema

### Tables Overview

The application uses three main tables:

1. **`stories`** - Stores story content and metadata
2. **`translations`** - Stores translated versions of stories
3. **`user_progress`** - Tracks user learning progress

### Schema Details

#### Stories Table
```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `title`: Story title
- `content`: Full story text
- `language`: Source language code (e.g., 'en', 'es', 'fr')
- `difficulty_level`: Learning difficulty ('beginner', 'intermediate', 'advanced')
- `user_id`: Optional user who created the story
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

#### Translations Table
```sql
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, target_language)
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `story_id`: Reference to the original story
- `target_language`: Target language code
- `translated_content`: Translated story text
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

#### User Progress Table
```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `user_id`: User identifier
- `story_id`: Reference to the story
- `progress_percentage`: Learning progress (0-100)
- `completed`: Whether the story is completed
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

## Database Services

### StoryService

Handles all story-related operations:

```typescript
import { StoryService } from '@/api/supabase'

// Create a new story
const story = await StoryService.createStory({
  title: 'The Little Red Hen',
  content: 'Once upon a time...',
  language: 'en',
  difficulty_level: 'beginner'
})

// Get stories with filters
const stories = await StoryService.getStories({
  language: 'en',
  difficulty_level: 'beginner'
})

// Search stories
const results = await StoryService.searchStories('hen')
```

### TranslationService

Manages story translations:

```typescript
import { TranslationService } from '@/api/supabase'

// Create a translation
const translation = await TranslationService.createTranslation({
  story_id: 'story-uuid',
  target_language: 'es',
  translated_content: 'Érase una vez...'
})

// Get translation for specific story and language
const translation = await TranslationService.getTranslationByStoryAndLanguage(
  'story-uuid',
  'es'
)
```

### UserProgressService

Tracks user learning progress:

```typescript
import { UserProgressService } from '@/api/supabase'

// Update user progress
const progress = await UserProgressService.updateProgressPercentage(
  'user-uuid',
  'story-uuid',
  75
)

// Mark story as completed
await UserProgressService.markStoryAsCompleted('user-uuid', 'story-uuid')

// Get user statistics
const stats = await UserProgressService.getUserStatistics('user-uuid')
```

## Authentication

### Setup

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure authentication settings:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: Add your app URLs
   - **Email Templates**: Customize if needed

### Usage

```typescript
import { useSupabase } from '@/api/supabase'

function AuthComponent() {
  const { user, loading, signIn, signUp, signOut } = useSupabase()

  const handleSignIn = async () => {
    await signIn('user@example.com', 'password')
  }

  const handleSignUp = async () => {
    await signUp('user@example.com', 'password')
  }

  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  )
}
```

## Real-time Features

### Setup

Real-time subscriptions are automatically enabled in Supabase. No additional setup required.

### Usage

```typescript
import { useRealtimeSubscription } from '@/api/supabase'

function StoryList() {
  const [stories, setStories] = useState([])

  // Subscribe to story changes
  useRealtimeSubscription('stories', (payload) => {
    if (payload.eventType === 'INSERT') {
      setStories(prev => [...prev, payload.new])
    }
  })

  return <div>{/* Render stories */}</div>
}
```

## Row Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
```

### Policies

#### Stories Table
```sql
-- Allow public read access to stories
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (true);

-- Allow authenticated users to create stories
CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stories
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own stories
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);
```

#### Translations Table
```sql
-- Allow public read access to translations
CREATE POLICY "Translations are viewable by everyone" ON translations
  FOR SELECT USING (true);

-- Allow authenticated users to create translations
CREATE POLICY "Users can create translations" ON translations
  FOR INSERT WITH CHECK (true);

-- Allow users to update translations
CREATE POLICY "Users can update translations" ON translations
  FOR UPDATE USING (true);
```

#### User Progress Table
```sql
-- Allow users to view their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow users to create their own progress
CREATE POLICY "Users can create own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow users to delete their own progress
CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

## Local Development

### Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Initialize project:
```bash
supabase init
```

4. Start local development:
```bash
supabase start
```

5. Apply migrations:
```bash
supabase db reset
```

### Environment Variables for Local Development

When using Supabase CLI locally, update your `.env`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## Production Deployment

### Environment Variables

For production, use your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Database Migrations

1. Create migration files in `supabase/migrations/`
2. Apply migrations to production:
```bash
supabase db push
```

### Backup and Restore

```bash
# Create backup
supabase db dump

# Restore from backup
supabase db restore backup.sql
```

## Monitoring and Analytics

### Database Monitoring

1. Go to **Database** → **Logs** in Supabase dashboard
2. Monitor query performance and errors
3. Set up alerts for slow queries

### Authentication Analytics

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Monitor user sign-ups and activity
3. Review failed authentication attempts

## Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** to control data access
3. **Validate input** on both client and server
4. **Use prepared statements** (handled by Supabase client)
5. **Regular security audits** of your policies
6. **Monitor access logs** for suspicious activity

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check network connectivity
   - Ensure Supabase project is active

2. **Authentication Issues**
   - Verify site URL configuration
   - Check redirect URL settings
   - Review email confirmation settings

3. **RLS Policy Issues**
   - Test policies in Supabase dashboard
   - Check user authentication status
   - Verify policy syntax

4. **Real-time Issues**
   - Ensure real-time is enabled
   - Check subscription syntax
   - Verify table permissions

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com) 