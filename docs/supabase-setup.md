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

The application uses four main tables:

1. **`users`** - Stores user profiles and preferences
2. **`stories`** - Stores story content and metadata
3. **`translations`** - Stores translated versions of stories
4. **`user_progress`** - Tracks user learning progress (optional)

> **Note**: The `user_progress` table is available but not actively used in the current implementation. User progress tracking can be enabled as needed.

### Schema Details

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: References Supabase auth.users (UUID)
- `username`: Unique username for the user
- `display_name`: User's display name
- `avatar_url`: URL to user's avatar image
- `preferred_language`: User's preferred language for translations
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

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

> **Note**: The `user_progress` table schema has been removed from the current implementation. The schema can be added back when user progress tracking is needed.

## Project Structure

### File Organization

The Supabase integration follows this structure:

```
src/
├── api/supabase/
│   ├── client.ts                    # Supabase client configuration & types
│   ├── index.ts                     # Centralized exports
│   └── database/
│       ├── userService.ts           # User database operations
│       ├── storyService.ts          # Story database operations
│       └── translationService.ts    # Translation database operations
├── components/auth/
│   ├── SignInForm.tsx               # User sign-in component
│   ├── SignUpForm.tsx               # User sign-up component
│   └── UserProfile.tsx              # User profile management
├── pages/
│   ├── AuthPage.tsx                 # Authentication page
│   └── DashboardPage.tsx            # User dashboard
├── hooks/
│   └── useSupabase.ts               # React hooks for auth & real-time
└── [other folders...]
```

### Import Patterns

- **Database Services**: Import from `@/api/supabase`
- **React Hooks**: Import from `@/hooks/useSupabase`
- **Client & Types**: Import from `@/api/supabase/client`

## Database Services

### UserService

Handles all user-related operations:

```typescript
import { UserService } from '@/api/supabase'

// Get user by ID
const user = await UserService.getUser('user-uuid')

// Create a new user
const user = await UserService.createUser({
  id: 'user-uuid',
  username: 'john_doe',
  display_name: 'John Doe',
  preferred_language: 'en'
})

// Update user profile
const updatedUser = await UserService.updateUser('user-uuid', {
  display_name: 'John Smith',
  preferred_language: 'es'
})

// Check username availability
const isAvailable = await UserService.isUsernameAvailable('john_doe')
```

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

> **Note**: The `UserProgressService` is available but not actively used in the current implementation. User progress tracking can be enabled as needed.

## Authentication & User Management

### Setup

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure authentication settings:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: Add your app URLs
   - **Email Templates**: Customize if needed

### User Registration

Users can register with email, password, username, and display name:

```typescript
import { useSupabase } from '@/hooks/useSupabase'

function SignUpForm() {
  const { signUp } = useSupabase()

  const handleSignUp = async (email: string, password: string, username: string, displayName: string) => {
    await signUp(email, password, { username, display_name: displayName })
  }
}
```

### User Authentication

```typescript
import { useSupabase } from '@/hooks/useSupabase'

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

### User Profile Management

```typescript
import { UserService } from '@/api/supabase'

// Update user profile
const updateProfile = async (userId: string, updates: any) => {
  const updatedUser = await UserService.updateUser(userId, {
    display_name: 'New Name',
    preferred_language: 'es'
  })
}

// Get user profile
const getUserProfile = async (userId: string) => {
  const user = await UserService.getUser(userId)
}
```

## Real-time Features

### Setup

Real-time subscriptions are automatically enabled in Supabase. No additional setup required.

### Usage

```typescript
import { useRealtimeSubscription } from '@/hooks/useSupabase'

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
```

### Policies

#### Users Table
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON users
  FOR DELETE USING (auth.uid() = id);
```

#### Stories Table
```sql
-- Allow public read access to stories
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (true);

-- Allow authenticated users to create stories
CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own stories
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own stories
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
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

> **Note**: The `user_progress` table and its RLS policies are available but not actively used in the current implementation. These can be enabled when user progress tracking is needed.

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