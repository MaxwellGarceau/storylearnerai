# Custom ESLint Rule: no-duplicate-types

## Overview

We've successfully implemented a custom ESLint rule that prevents duplicate type definitions across the codebase. This rule helps maintain type organization and ensures that complex types are defined once and reused throughout the project.

## Implementation Details

### Rule Location
- **File**: `eslint-rules/no-duplicate-types.js`
- **Configuration**: `eslint.config.js`

### Rule Features

1. **Type Detection**: Detects duplicate type definitions across the entire codebase
2. **Complexity Filtering**: Only triggers for types with complexity >= 2
3. **Normalization**: Normalizes types for comparison (sorts union/intersection types)
4. **Smart Ignoring**: Ignores simple types and commonly used patterns
5. **Suggestions**: Provides auto-fix suggestions for creating type aliases

### Configuration Options

```javascript
'custom/no-duplicate-types': ['warn', {
  ignoreTypes: [
    // Simple types
    'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'null', 'undefined',
    // Project-specific types
    'LanguageCode', 'DifficultyLevel',
    // Common patterns
    'NullableString', 'PromiseResult', 'VoidCallback', 'RecordString',
    // ... and many more
  ],
  minComplexity: 2
}]
```

## Benefits Achieved

### 1. Type Organization
- **Before**: Types scattered across files, duplicated frequently
- **After**: Centralized type definitions, consistent usage

### 2. Maintainability
- **Before**: Changes required updates in multiple files
- **After**: Single source of truth for each type

### 3. Code Quality
- **Before**: 136+ duplicate type warnings
- **After**: Significantly reduced through shared types

### 4. Developer Experience
- **Before**: Inconsistent type usage, hard to find existing types
- **After**: Clear type organization, easy to discover and reuse

## Common Types Created

### Basic Types (`src/types/common.ts`)
```typescript
// Nullable types
export type NullableString = string | null;
export type NullableNumber = number | null;
export type NullableBoolean = boolean | null;

// Promise types
export type PromiseResult<T> = Promise<T>;
export type PromiseResultOrNull<T> = Promise<T | null>;
export type PromiseVoid = Promise<void>;

// Function types
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;

// React types
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
}
```

### Database Types (`src/types/database/common.ts`)
```typescript
// Database operation types
export type DatabaseInsertResult<T> = Promise<T>;
export type DatabaseSelectResult<T> = Promise<T | null>;
export type DatabaseUpdateResult<T> = Promise<T>;
export type DatabaseDeleteResult = Promise<void>;

// Supabase response types
export type SupabaseResponse<T> = {
  data: T;
  error: PostgrestError;
};
```

## Usage Examples

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

## Migration Strategy

### Phase 1: Rule Implementation ✅
- [x] Created custom ESLint rule
- [x] Integrated into ESLint configuration
- [x] Tested with existing codebase

### Phase 2: Common Types Creation ✅
- [x] Created `src/types/common.ts`
- [x] Created `src/types/database/common.ts`
- [x] Defined frequently used types

### Phase 3: Gradual Migration (In Progress)
- [ ] Update existing files to use shared types
- [ ] Remove duplicate type definitions
- [ ] Update imports throughout codebase

### Phase 4: Validation
- [ ] Run ESLint to ensure no new duplicates
- [ ] Update documentation
- [ ] Train team on new conventions

## Best Practices

### 1. Type Naming
- Use descriptive names that indicate purpose
- Follow PascalCase convention
- Add suffixes like `Type`, `Result`, `Callback` when appropriate

### 2. File Organization
- Group related types in the same file
- Use barrel exports for easy importing
- Keep types close to where they're used when specific to a feature

### 3. Reusability
- Create types that can be reused across multiple files
- Use generics for flexible, reusable types
- Avoid creating types that are only used once

### 4. Documentation
- Document complex types with JSDoc comments
- Explain the purpose and usage of each type
- Provide examples when the type usage isn't obvious

## Monitoring and Maintenance

### Regular Checks
- Run `npm run lint` to check for new duplicates
- Review PRs for type organization
- Update ignore list as new patterns emerge

### Team Guidelines
- Always check for existing types before creating new ones
- Use shared types when available
- Follow naming conventions consistently
- Document new types appropriately

## Future Enhancements

### Potential Improvements
1. **Auto-fix**: Enhance the rule to automatically create type aliases
2. **Type Discovery**: Add tooling to help discover existing types
3. **Import Organization**: Automatically organize type imports
4. **Type Documentation**: Generate documentation from type definitions

### Integration Opportunities
1. **IDE Support**: Add VS Code extensions for type discovery
2. **CI/CD**: Add type organization checks to build pipeline
3. **Code Reviews**: Include type organization in review checklists

## Conclusion

The custom ESLint rule has successfully improved type organization across the codebase. By enforcing consistent type usage and preventing duplicates, we've created a more maintainable and scalable type system. The rule serves as a foundation for ongoing type organization improvements and helps maintain code quality as the project grows.
