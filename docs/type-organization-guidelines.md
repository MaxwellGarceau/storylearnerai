# Type Organization Guidelines

This document outlines the guidelines for organizing TypeScript types in the Story Learner AI application to maintain consistency and improve maintainability.

## Overview

Types should be organized in dedicated type files when they are used by multiple components or services. This promotes reusability, reduces duplication, and makes the codebase easier to maintain.

## Type File Structure

### Dedicated Type Files
- **`src/lib/types/`** - Core application types
  - `database.ts` - Database schema types
  - `llm.ts` - LLM service types
  - `prompt.ts` - Prompt configuration types
  - `walkthrough.ts` - Walkthrough system types
- **`src/types/`** - Feature-specific types
  - `savedStories.ts` - Saved stories feature types

### Component-Specific Types
Types that are only used within a single component can remain in the component file, but should follow naming conventions.

## When to Move Types to Dedicated Files

### ✅ **Move to dedicated type files when:**
- Type is used by 2+ files
- Type represents a core domain concept
- Type is part of a public API
- Type is used across different features
- Type is complex (multiple properties, nested objects)

### ❌ **Keep in component file when:**
- Type is only used within one component
- Type is a simple prop interface for that component
- Type is internal/private to the component
- Type is a temporary/local type

## Naming Conventions

### Type Files
- Use descriptive names: `database.ts`, `llm.ts`, `prompt.ts`
- Group related types together
- Use kebab-case for file names

### Type Names
- **Interfaces**: PascalCase (e.g., `UserProfile`, `TranslationResponse`)
- **Type Aliases**: PascalCase (e.g., `LanguageCode`, `DifficultyLevel`)
- **Internal Types**: Prefix with `Internal`, `Private`, or `Local` (e.g., `InternalState`, `PrivateHelper`)

## ESLint Rules

The following ESLint rules help enforce type organization:

### Naming Conventions
```javascript
'@typescript-eslint/naming-convention': [
  'warn',
  {
    selector: 'interface',
    format: ['PascalCase'],
    custom: {
      regex: '^[A-Z][a-zA-Z0-9]*$',
      match: true
    }
  },
  {
    selector: 'typeAlias',
    format: ['PascalCase'],
    custom: {
      regex: '^[A-Z][a-zA-Z0-9]*$',
      match: true
    }
  }
]
```

### Unused Variables
```javascript
'@typescript-eslint/no-unused-vars': ['error', { 
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
}]
```

## Examples

### ✅ **Good: Types in dedicated files**

```typescript
// src/lib/types/database.ts
export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';
```

```typescript
// src/components/UserProfile.tsx
import type { DatabaseUser, UserRole } from '@/lib/types/database';

interface UserProfileProps {
  user: DatabaseUser;
  role: UserRole;
}
```

### ❌ **Bad: Types scattered across components**

```typescript
// src/components/UserProfile.tsx
interface DatabaseUser {
  id: string;
  username: string;
  email: string;
}

interface UserProfileProps {
  user: DatabaseUser;
}
```

```typescript
// src/components/UserList.tsx
interface DatabaseUser {  // Duplicate definition!
  id: string;
  username: string;
  email: string;
}
```

### ✅ **Good: Component-specific types**

```typescript
// src/components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

// This is fine because it's only used in this component
```

## Migration Strategy

### Step 1: Identify Shared Types
Look for types that appear in multiple files or represent core concepts.

### Step 2: Create Type Files
Create appropriate type files in `src/lib/types/` or `src/types/`.

### Step 3: Move Types
Move the types to the appropriate file and export them.

### Step 4: Update Imports
Update all files that use these types to import from the new location.

### Step 5: Remove Duplicates
Remove duplicate type definitions from component files.

## Tools and Scripts

### Manual Review
Regularly review your codebase for:
- Duplicate type definitions
- Types that could be shared
- Types that belong in dedicated files

### ESLint Integration
The ESLint configuration will warn about:
- Inconsistent naming conventions
- Unused variables
- Potential type organization issues

## Best Practices

1. **Start with dedicated files**: When creating new features, start by defining types in dedicated files
2. **Group related types**: Keep related types together in the same file
3. **Use descriptive names**: Make type names self-documenting
4. **Export everything**: Always export types that might be used elsewhere
5. **Document complex types**: Add JSDoc comments for complex types
6. **Review regularly**: Periodically review type organization

## Common Patterns

### Database Types
```typescript
// src/lib/types/database.ts
export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type DatabaseUserInsert = Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
export type DatabaseUserUpdate = Partial<DatabaseUserInsert>;
```

### API Response Types
```typescript
// src/lib/types/api.ts
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Component Props
```typescript
// src/lib/types/components.ts
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}
```

## Conclusion

Following these guidelines will help maintain a clean, organized, and maintainable type system. The key is to think about reusability and organization from the start, and to regularly review and refactor as the codebase grows. 