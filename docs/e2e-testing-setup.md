# E2E Integration Testing Setup

This document describes the End-to-End (E2E) integration testing setup for the StoryLearnerAI application using Supabase as the test database.

## Overview

The E2E testing setup provides a complete testing environment that includes:

- **Separate Test Database**: Isolated Supabase instance for testing
- **Test Utilities**: Helper functions for database setup, teardown, and data seeding
- **Integration Tests**: Full-stack tests that verify database operations and business logic
- **Automated Management**: Scripts to start, stop, and manage the test environment

## Architecture

### Test Database Configuration

The test setup uses a separate Supabase configuration (`supabase/config.test.toml`) that:

- Runs on different ports to avoid conflicts with development
- Disables seeding to ensure clean test state
- Disables Studio to reduce resource usage
- Uses the same schema as production

### Test Utilities Structure

```
src/__tests__/test-utils/e2e/
├── supabase-test-client.ts    # Test-specific Supabase client
├── test-database.ts           # Database management utilities
└── test-setup.ts              # Global test configuration
```

### Test Files Structure

```
src/__tests__/e2e/
├── story-service.integration.test.ts      # Story service E2E tests
├── translation-service.integration.test.ts # Translation service E2E tests
└── full-application-flow.integration.test.ts # Complete workflow tests
```

## Setup Instructions

### Prerequisites

1. **Supabase CLI**: Install the Supabase CLI globally
   ```bash
   npm install -g supabase
   ```

2. **Environment Variables**: Add test configuration to your `.env` file
   ```bash
   # Copy from env.example
   VITE_SUPABASE_TEST_URL=http://127.0.0.1:54331
   VITE_SUPABASE_TEST_ANON_KEY=test-anon-key
   VITE_SUPABASE_TEST_SERVICE_ROLE_KEY=test-service-role-key
   ```

### Initial Setup

1. **Start the test database**:
   ```bash
   npm run test:db:start
   ```

2. **Verify the setup**:
   ```bash
   npm run test:db:status
   ```

## Usage

### Running E2E Tests

#### Run all E2E tests:
```bash
npm run test:e2e
```

#### Run with test database management:
```bash
npm run test:db:run
```

#### Run specific test file:
```bash
npm run test:once -- src/__tests__/e2e/story-service.integration.test.ts
```

### Database Management

#### Start test database:
```bash
npm run test:db:start
```

#### Stop test database:
```bash
npm run test:db:stop
```

#### Reset test database (clear all data):
```bash
npm run test:db:reset
```

#### Check test database status:
```bash
npm run test:db:status
```

### Manual Script Usage

You can also use the test database script directly:

```bash
# Start test database
./scripts/test-db.sh start

# Run tests
./scripts/test-db.sh test

# Stop test database
./scripts/test-db.sh stop

# Show help
./scripts/test-db.sh help
```

## Test Utilities

### TestDatabase Class

The `TestDatabase` class provides utilities for managing test data:

```typescript
import { createTestDatabase } from '@/__tests__/test-utils/e2e/test-database'

const testDb = createTestDatabase()

// Clear all data
await testDb.clearAllData()

// Seed test data
await testDb.seedTestData(stories, translations)

// Setup for a test
await testDb.setup(stories, translations)

// Cleanup after a test
await testDb.teardown()
```

### Test Supabase Client

Create test-specific Supabase clients:

```typescript
import { createDefaultTestClient } from '@/__tests__/test-utils/e2e/supabase-test-client'

const supabaseClient = createDefaultTestClient()
```

### Test Data Factories

Create test data with default values:

```typescript
import { createTestDatabase } from '@/__tests__/test-utils/e2e/test-database'

const testDb = createTestDatabase()

// Create a test story
const story = testDb.createTestStory({
  title: 'Custom Title',
  difficulty_level: 'advanced'
})

// Create a test translation
const translation = testDb.createTestTranslation(storyId, {
  target_language: 'fr',
  translated_content: 'Custom content'
})
```

## Writing E2E Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createDefaultTestClient } from '@/__tests__/test-utils/e2e/supabase-test-client'
import { getTestDatabase } from '@/__tests__/test-utils/e2e/test-setup'
import { storyService } from '@/api/supabase/database/storyService'

// Import test setup to ensure Supabase is running
import '@/__tests__/test-utils/e2e/test-setup'

describe('My Service E2E Tests', () => {
  let testDb: ReturnType<typeof getTestDatabase>
  let supabaseClient: ReturnType<typeof createDefaultTestClient>

  beforeEach(async () => {
    testDb = getTestDatabase()
    supabaseClient = createDefaultTestClient()
    
    // Ensure clean state
    await testDb.clearAllData()
  })

  it('should perform a complete workflow', async () => {
    // Arrange
    const testData = { /* your test data */ }
    await testDb.seedTestData(testData)

    // Act
    const result = await storyService.someOperation(supabaseClient, data)

    // Assert
    expect(result).toBeDefined()
    expect(result.property).toBe(expectedValue)
  })
})
```

### Test Patterns

#### 1. CRUD Operations Testing
```typescript
it('should create, read, update, and delete a resource', async () => {
  // Create
  const created = await service.create(client, data)
  expect(created.id).toBeDefined()

  // Read
  const retrieved = await service.getById(client, created.id)
  expect(retrieved).toEqual(created)

  // Update
  const updated = await service.update(client, created.id, newData)
  expect(updated.property).toBe(newData.property)

  // Delete
  await service.delete(client, created.id)
  const deleted = await service.getById(client, created.id)
  expect(deleted).toBeNull()
})
```

#### 2. Relationship Testing
```typescript
it('should handle relationships correctly', async () => {
  // Create parent
  const parent = await parentService.create(client, parentData)
  
  // Create child
  const child = await childService.create(client, { ...childData, parentId: parent.id })
  
  // Verify relationship
  const children = await childService.getByParentId(client, parent.id)
  expect(children).toContainEqual(child)
  
  // Test cascading deletion
  await parentService.delete(client, parent.id)
  const remainingChildren = await childService.getByParentId(client, parent.id)
  expect(remainingChildren).toHaveLength(0)
})
```

#### 3. Error Handling Testing
```typescript
it('should handle errors gracefully', async () => {
  // Test invalid data
  await expect(service.create(client, invalidData))
    .rejects.toThrow()

  // Test non-existent resources
  const result = await service.getById(client, 'non-existent-id')
  expect(result).toBeNull()

  // Test constraint violations
  await expect(service.create(client, duplicateData))
    .rejects.toThrow()
})
```

## Best Practices

### 1. Test Isolation
- Always clear data before each test
- Use unique test data to avoid conflicts
- Don't rely on data from previous tests

### 2. Test Data Management
- Use factories to create test data
- Keep test data realistic but minimal
- Use descriptive names for test data

### 3. Assertions
- Test both positive and negative cases
- Verify data integrity and relationships
- Check error conditions and edge cases

### 4. Performance
- Keep tests focused and fast
- Use appropriate timeouts
- Clean up resources properly

### 5. Maintainability
- Use descriptive test names
- Group related tests in describe blocks
- Extract common setup into helper functions

## Troubleshooting

### Common Issues

#### 1. Test Database Not Starting
```bash
# Check if Supabase CLI is installed
supabase --version

# Check if ports are available
lsof -i :54331
lsof -i :54332

# Reset and restart
npm run test:db:reset
npm run test:db:start
```

#### 2. Tests Failing with Connection Errors
- Ensure test database is running: `npm run test:db:status`
- Check environment variables are set correctly
- Verify test configuration in `supabase/config.test.toml`

#### 3. Tests Hanging or Timing Out
- Increase timeout in `vite.config.ts`
- Check for infinite loops in test setup
- Ensure proper cleanup in `afterEach` hooks

#### 4. Data Persistence Between Tests
- Ensure `beforeEach` clears data: `await testDb.clearAllData()`
- Check that test setup is imported: `import '@/__tests__/test-utils/e2e/test-setup'`
- Verify no global state is being shared

### Debug Mode

Run tests with verbose output:
```bash
npm run test:e2e -- --reporter=verbose
```

### Manual Database Inspection

Connect to the test database directly:
```bash
# Using psql
psql postgresql://postgres:postgres@127.0.0.1:54332/postgres

# Using Supabase CLI
supabase db reset --config-file supabase/config.test.toml
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Supabase CLI
        run: npm install -g supabase
        
      - name: Start test database
        run: npm run test:db:start
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_TEST_URL: http://127.0.0.1:54331
          VITE_SUPABASE_TEST_ANON_KEY: test-anon-key
          VITE_SUPABASE_TEST_SERVICE_ROLE_KEY: test-service-role-key
          
      - name: Stop test database
        if: always()
        run: npm run test:db:stop
```

## Advanced Topics

### Custom Test Configurations

You can create custom test configurations for different scenarios:

```typescript
import { createTestSupabaseClient } from '@/__tests__/test-utils/e2e/supabase-test-client'

const customConfig = {
  url: 'http://localhost:54331',
  anonKey: 'custom-anon-key',
  serviceRoleKey: 'custom-service-role-key'
}

const customClient = createTestSupabaseClient(customConfig)
```

### Parallel Test Execution

For parallel test execution, ensure each test uses unique data:

```typescript
const uniqueId = Date.now() + Math.random()
const uniqueStory = {
  title: `Test Story ${uniqueId}`,
  content: `Content ${uniqueId}`,
  language: 'en',
  difficulty_level: 'beginner'
}
```

### Performance Testing

For performance testing, you can create larger datasets:

```typescript
const createLargeDataset = async (count: number) => {
  const stories = Array.from({ length: count }, (_, i) => ({
    title: `Story ${i}`,
    content: `Content ${i}`,
    language: 'en',
    difficulty_level: 'beginner'
  }))
  
  return await Promise.all(
    stories.map(story => storyService.createStory(supabaseClient, story))
  )
}
```

## Conclusion

This E2E testing setup provides a robust foundation for testing your application's database integration. It ensures that your tests run in an isolated environment and can verify the complete functionality of your application stack.

For questions or issues, refer to the troubleshooting section or check the test utilities documentation. 