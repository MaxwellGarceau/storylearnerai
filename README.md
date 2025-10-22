# StoryLearnerAI

An AI-powered language learning application that helps users learn new languages by adapting target learning material to their level of comprehensible input.

_Under construction, but get a sneak peak of the alpha verison =)_

https://github.com/user-attachments/assets/98020bd1-0614-49dd-9f30-d9dbd2070ecd

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
- **LLM Integration**: Google Gemini
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint

## Documentation Table of Contents

### Core Systems & Architecture

- **[LLM Service System](docs/llm-service-system.md)** - AI-powered translation and content generation with provider-agnostic architecture
- **[LLM Prompt System](docs/llm-prompt-system.md)** - Dynamic prompt configuration and CEFR-based difficulty management
- **[Word Translation System](docs/word-translation-system.md)** - Token-based architecture with rich linguistic metadata for language learning
- **[Translation Flow](docs/translation-flow.md)** - From/To language selection and end-to-end translation workflow
- **[Translation Schema](docs/translation-schema.md)** - Database schema for translations and token sequences
- **[Dictionary System](docs/dictionary-system.md)** - Real-time word lookup and definition system with caching
- **[Routing System](docs/routing-system.md)** - Application navigation and routing with protected routes
- **[Authentication System](docs/auth-system.md)** - User authentication and authorization with Supabase

### AI & Machine Learning

- **[Gemini Service Example](docs/gemini-service-example.md)** - Google Gemini configuration and usage patterns
- **[LLM Integration & AI Features](docs/_walkthrough-for-fueled.md#llm-integration--ai-features)** - Comprehensive AI/ML integration showcase

### Development & Quality Assurance

- **[Tools](docs/tools.md)** - Development and build tools with CI/CD pipeline details
- **[E2E Testing Setup](docs/e2e-qa.md)** - End-to-end testing configuration and QA instructions
- **[Security Features](docs/security-features.md)** - Comprehensive security implementation with XSS prevention
- **[Custom ESLint Rule Implementation](docs/custom-eslint-rule-implementation.md)** - Custom linting rules for type organization
- **[No Non-Localized Text ESLint Rule](docs/no-non-localized-text-rule.md)** - Localization enforcement for internationalization
- **[Type Organization Guidelines](docs/type-organization-guidelines.md)** - TypeScript type management and best practices

### Database & Backend

- **[Supabase Setup](docs/supabase-setup.md)** - Database configuration, schema, and RLS policies
- **[Vocabulary Saving](docs/vocabulary-saving.md)** - Vocabulary management and user learning progress

### User Experience & Interface

- **[Walkthrough System](docs/walkthrough-system.md)** - Interactive user onboarding with guided tutorials
- **[Form Component Variants](docs/form-variants.md)** - cva/cn variants for consistent form UI components

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

# Apply migrations and create test user (recommended)
npm run db:reset

# Or apply migrations without creating test user
npm run db:reset:no-user
```

4. The initial schema includes:
   - `users` table: Stores user profiles and preferences
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

## User Seeding and Security

### Why User Seeding is Not in seed.sql

For security reasons, user accounts are **not** seeded in the `supabase/seed.sql` file. Here's why:

- **Credential Security**: Hardcoded passwords in seed files pose security risks
- **Production Safety**: Seed files can run in production, potentially creating unwanted test accounts
- **Service Role Exposure**: User creation requires elevated privileges that shouldn't be in seed files
- **Version Control**: Credentials in seed files would be committed to version control

### Proper User Creation for Development

Use the dedicated script for creating test users:

```bash
# Create a test user with default credentials
npm run create-test-user

# Or set custom credentials via environment variables
TEST_USER_EMAIL=your-email@example.com \
TEST_USER_PASSWORD=YourSecurePass123! \
TEST_USER_USERNAME=yourusername \
TEST_USER_DISPLAY_NAME="Your Name" \
npm run create-test-user
```

### Database Reset with Test User

For a complete development setup, use the enhanced database reset:

```bash
# Reset database and create test user
npm run db:reset
./scripts/create-test-user.js
```
