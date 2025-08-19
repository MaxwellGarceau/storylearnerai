# Type Organization Guidelines

## Overview

This document outlines the guidelines for organizing TypeScript types in the StoryLearnerAI project to prevent duplicate type definitions and maintain a clean, maintainable codebase.

## Custom ESLint Rule: `no-duplicate-types`

We've implemented a custom ESLint rule that prevents duplicate type definitions across the codebase. This rule:

- Detects when the same type is defined in multiple places
- Suggests creating reusable type aliases
- Ignores simple types (string, number, boolean, etc.)
- Only triggers for types with complexity >= 2

## Common Duplicate Types Found

### 1. Nullable String Types
```typescript
// ❌ Duplicate across many files
type SomeField = string | null;

// ✅ Create a reusable type
export type NullableString = string | null;
```

### 2. Promise Return Types
```typescript
// ❌ Duplicate across services
async function someFunction(): Promise<DatabaseUserInsert> { ... }

// ✅ Create reusable types
export type UserInsertPromise = Promise<DatabaseUserInsert>;
export type UserInsertOrNullPromise = Promise<DatabaseUserInsert | null>;
```

### 3. Function Types
```typescript
// ❌ Duplicate callback types
type Callback = () => void;
type AuthCallback = (email: string, password: string) => Promise<boolean>;

// ✅ Create reusable types
export type VoidCallback = () => void;
export type AuthFunction = (email: string, password: string) => Promise<boolean>;
```

### 4. Object Types
```typescript
// ❌ Duplicate validation result types
type ValidationResult = {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
};

// ✅ Create reusable type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
}
```

## Type Organization Strategy

### 1. Create Shared Type Files

Create dedicated type files for common patterns:

```typescript
// src/types/common.ts
export type NullableString = string | null;
export type NullableNumber = number | null;
export type NullableBoolean = boolean | null;

export type PromiseResult<T> = Promise<T>;
export type PromiseResultOrNull<T> = Promise<T | null>;

export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;

export type RecordString = Record<string, string>;
export type RecordUnknown = Record<string, unknown>;
```

### 2. Service-Specific Type Files

Create type files for each service:

```typescript
// src/types/database/common.ts
export type DatabaseInsertResult<T> = Promise<T>;
export type DatabaseSelectResult<T> = Promise<T | null>;
export type DatabaseUpdateResult<T> = Promise<T>;

export type SupabaseResponse<T> = {
  data: T;
  error: PostgrestError;
};
```

### 3. Component-Specific Type Files

Create type files for components:

```typescript
// src/types/components/auth.ts
export type AuthCallback = () => void;
export type AuthSuccessCallback = () => void;
export type AuthErrorCallback = (error: string) => void;
```

## Implementation Steps

### Step 1: Create Common Types

1. Create `src/types/common.ts` with frequently used types
2. Create `src/types/database/common.ts` for database-related types
3. Create `src/types/components/common.ts` for component-related types

### Step 2: Update Existing Code

Replace duplicate types with imports:

```typescript
// Before
function someFunction(): Promise<DatabaseUserInsert> { ... }

// After
import type { DatabaseInsertResult } from '@/types/database/common';
import type { DatabaseUserInsert } from '@/types/database/user';

function someFunction(): DatabaseInsertResult<DatabaseUserInsert> { ... }
```

### Step 3: Update ESLint Configuration

Add new types to the ignore list as needed:

```javascript
// eslint.config.js
'custom/no-duplicate-types': ['warn', {
  ignoreTypes: [
    'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'null', 'undefined',
    'LanguageCode', 'DifficultyLevel', 'NullableString', 'PromiseResult', 'VoidCallback'
  ],
  minComplexity: 2
}]
```

## Best Practices

### 1. Naming Conventions

- Use PascalCase for type names
- Use descriptive names that indicate the purpose
- Add suffixes like `Type`, `Result`, `Callback`, `Promise` when appropriate

### 2. File Organization

- Group related types in the same file
- Use barrel exports (`index.ts`) for easy importing
- Keep types close to where they're used when they're specific to a feature

### 3. Type Reusability

- Create types that can be reused across multiple files
- Use generics for flexible, reusable types
- Avoid creating types that are only used once

### 4. Documentation

- Document complex types with JSDoc comments
- Explain the purpose and usage of each type
- Provide examples when the type usage isn't obvious

## Migration Strategy

### Phase 1: Identify and Group
1. Run the ESLint rule to identify all duplicates
2. Group similar types together
3. Create a plan for consolidation

### Phase 2: Create Shared Types
1. Create common type files
2. Define the most frequently used types
3. Update ESLint configuration

### Phase 3: Gradual Migration
1. Update one file at a time
2. Test after each change
3. Update imports throughout the codebase

### Phase 4: Validation
1. Run ESLint to ensure no new duplicates
2. Update documentation
3. Train team on new conventions

## Examples

### Before (Duplicate Types)
```typescript
// file1.ts
function getUser(): Promise<DatabaseUserInsert | null> { ... }

// file2.ts
function createUser(): Promise<DatabaseUserInsert | null> { ... }

// file3.ts
function updateUser(): Promise<DatabaseUserInsert | null> { ... }
```

### After (Reusable Types)
```typescript
// types/database/common.ts
export type UserResult = Promise<DatabaseUserInsert | null>;

// file1.ts
import type { UserResult } from '@/types/database/common';
function getUser(): UserResult { ... }

// file2.ts
import type { UserResult } from '@/types/database/common';
function createUser(): UserResult { ... }

// file3.ts
import type { UserResult } from '@/types/database/common';
function updateUser(): UserResult { ... }
```

## Benefits

1. **Maintainability**: Changes to types only need to be made in one place
2. **Consistency**: Ensures the same type is used everywhere
3. **Readability**: Clear, descriptive type names improve code understanding
4. **Refactoring**: Easier to refactor when types are centralized
5. **Type Safety**: Reduces the chance of type mismatches

## Monitoring

- Run `npm run lint` regularly to check for new duplicates
- Review PRs for type organization
- Update this document as new patterns emerge
- Regular team reviews of type organization 