# StoryLearnerAI

An AI-powered language learning application that helps users learn new languages through interactive stories and translations.

## Features

- **Story Generation**: Create engaging stories in multiple languages
- **Translation Services**: Translate stories between different languages
- **Progress Tracking**: Monitor learning progress and completion status
- **User Authentication**: Secure user accounts and data management
- **Real-time Updates**: Live updates for collaborative learning

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: ShadCN, Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **LLM Integration**: OpenAI, Anthropic, Google Gemini, Llama
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd storylearnerai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
```env
# LLM Service Configuration
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=your-api-key-here
VITE_LLM_ENDPOINT=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4o-mini

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Get your project URL and anon key from the project settings

3. Run the database migrations:
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start Supabase locally
supabase start

# Apply migrations
supabase db reset
```

4. The initial schema includes:
   - `stories` table: Stores story content and metadata
   - `translations` table: Stores translated versions of stories
   - `user_progress` table: Tracks user learning progress

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Testing

Run tests:
```bash
npm test:once
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting

Check for linting errors:
```bash
npm run lint
```

Fix linting errors:
```bash
npm run lint:fix
```

## Database Schema

### Stories Table
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

### Translations Table
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

### User Progress Table
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

## Services

### StoryService
Handles all story-related database operations:
- Create, read, update, delete stories
- Search stories by title or content
- Filter stories by language and difficulty level

### TranslationService
Manages story translations:
- Store and retrieve translations
- Check for existing translations
- Update translation content

### UserProgressService
Tracks user learning progress:
- Record progress percentages
- Mark stories as completed
- Generate user statistics

## Authentication

The application uses Supabase Auth for user authentication. Users can:
- Sign up with email and password
- Sign in to existing accounts
- Reset passwords
- Access protected routes

## Real-time Features

Supabase real-time subscriptions enable:
- Live updates when stories are modified
- Real-time progress tracking
- Collaborative learning features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.
