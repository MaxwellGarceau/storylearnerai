# Security Features

This document outlines the comprehensive security measures implemented in the StoryLearnerAI application, with particular focus on input sanitization and XSS prevention.

## Overview

The application implements a multi-layered security approach to protect against common web vulnerabilities, especially focusing on the text input areas where users can enter stories for translation.

## Input Sanitization System

### Core Sanitization Utility

Located at `src/lib/utils/sanitization.ts`, this utility provides comprehensive text sanitization capabilities:

#### Key Features

- **DOMPurify Integration**: Uses the industry-standard DOMPurify library for HTML sanitization
- **Configurable Options**: Flexible sanitization options for different use cases
- **Real-time Validation**: Immediate feedback on potentially dangerous content
- **Length Limits**: Configurable maximum input lengths to prevent resource exhaustion

#### Main Functions

```typescript
// Sanitize text with default story options
sanitizeStoryText(input: string): string

// Validate text input and return detailed results
validateStoryText(input: string): {
  isValid: boolean;
  errors: string[];
  sanitizedText: string;
}
```

### Security Threats Prevented

#### 1. Cross-Site Scripting (XSS)

**Threat**: Malicious scripts injected through text input
**Prevention**: 
- Strips all `<script>` tags and their content
- Removes event handlers (`onclick`, `onerror`, etc.)
- Blocks JavaScript protocol URLs (`javascript:`)
- Handles nested and encoded script tags

**Example**:
```javascript
// Input: <script>alert('xss')</script>Hello world
// Output: Hello world
```

#### 2. HTML Injection

**Threat**: Unwanted HTML tags that could break layout or inject content
**Prevention**:
- By default, strips all HTML tags
- Optional whitelist for safe HTML tags when needed
- Preserves text content while removing markup

#### 3. Data URL Attacks

**Threat**: Malicious data URLs that could execute code
**Prevention**:
- Blocks `data:text/html` URLs
- Prevents iframe injection through data URLs

#### 4. Event Handler Injection

**Threat**: Event handlers that could execute malicious code
**Prevention**:
- Removes all `on*` attributes
- Handles various event handler patterns

### Configuration Options

The sanitization system supports flexible configuration:

```typescript
interface SanitizationOptions {
  allowHTML?: boolean;           // Default: false
  allowLineBreaks?: boolean;     // Default: true
  maxLength?: number;           // Default: 10000
  trim?: boolean;               // Default: true
  allowedTags?: string[];       // Custom allowed HTML tags
  allowedAttributes?: string[]; // Custom allowed HTML attributes
}
```

## Backend Validation and Sanitization

### UserService Security Implementation

The backend `UserService` class implements comprehensive validation and sanitization for all user data operations:

#### Input Validation and Sanitization
- **Data Type Validation**: Ensures all inputs are of correct types
- **Format Validation**: Validates email, username, display name, and language code formats
- **Security Sanitization**: Removes malicious content using the same sanitization utilities as frontend
- **Length Limits**: Enforces appropriate length limits for all fields
- **URL Validation**: Validates and sanitizes avatar URLs to prevent XSS

#### Business Logic Validation
- **Username Uniqueness**: Prevents duplicate usernames during creation and updates
- **Required Field Validation**: Ensures required fields are provided and valid
- **Language Code Validation**: Validates ISO 639-1 language codes
- **User ID Validation**: Ensures user IDs are valid strings

#### Security Features
- **XSS Prevention**: Strips HTML tags and malicious content from all text fields
- **URL Sanitization**: Removes dangerous characters from avatar URLs
- **Input Sanitization**: Uses the same `validateUsername`, `validateDisplayName` utilities as frontend
- **Error Handling**: Provides detailed error messages for validation failures

### Implementation Examples

#### User Creation with Validation
```typescript
static async createUser(data: CreateUserData): Promise<DatabaseUserInsert> {
  // Validate and sanitize input data
  const validation = this.validateCreateUserData(data);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  const { sanitizedData } = validation;

  // Check username availability if username is provided
  if (sanitizedData.username && sanitizedData.username !== null) {
    const isAvailable = await this.isUsernameAvailable(sanitizedData.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
  }

  // Proceed with database operation using sanitized data
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: sanitizedData.id,
      username: sanitizedData.username,
      display_name: sanitizedData.display_name,
      avatar_url: sanitizedData.avatar_url,
      preferred_language: sanitizedData.preferred_language || 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return user
}
```

#### Username Validation and Availability Check
```typescript
static async isUsernameAvailable(username: string): Promise<boolean> {
  // Validate username format
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    throw new Error(`Invalid username format: ${usernameValidation.errors[0]}`);
  }

  // Check database for existing username
  const { error } = await supabase
    .from('users')
    .select('id')
    .eq('username', usernameValidation.sanitizedText)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return true // Username is available
    }
    throw new Error(`Failed to check username availability: ${error.message}`)
  }

  return false // Username is taken
}
```

## Authentication Form Security

### SignInForm and SignUpForm Security

Both authentication forms implement comprehensive input sanitization and validation:

#### Email Input Security
- **Real-time Validation**: Email format validation with security checks
- **XSS Prevention**: Strips malicious HTML and script tags
- **Length Limits**: Enforces RFC 5321 email length limits (254 characters)
- **Format Validation**: Ensures proper email format before submission

#### Username Input Security
- **Character Restrictions**: Only allows letters, numbers, underscores, and hyphens
- **Length Validation**: 3-50 characters with real-time feedback
- **Security Sanitization**: Removes all HTML tags and malicious content
- **Format Enforcement**: Prevents submission with invalid characters

#### Display Name Security
- **Length Validation**: 2-100 characters with appropriate feedback
- **Content Sanitization**: Strips HTML tags while preserving text content
- **Security Checks**: Detects and prevents malicious content injection

#### Password Security
- **Existing Strength Validation**: Maintains current password strength requirements
- **Special Character Support**: Allows secure passwords with special characters
- **No Sanitization**: Passwords are not sanitized to preserve security

### Form Submission Security

#### Validation Flow
1. **Real-time Validation**: Input is validated as user types
2. **Final Validation**: All fields are re-validated before submission
3. **Submission Prevention**: Forms cannot be submitted with validation errors
4. **Error Display**: Clear error messages guide users to fix issues

#### Security Features
- **Button Disabling**: Submit buttons are disabled when validation errors exist
- **Error State Management**: Tracks validation errors across all form fields
- **Sanitized Data**: Only sanitized data is passed to backend services

### Implementation Examples

#### Email Validation
```typescript
import { validateEmail } from '../../lib/utils/sanitization';

const handleInputChange = (field: 'email' | 'password', value: string) => {
  if (field === 'email') {
    const validation = validateEmail(value);
    if (validation.isValid) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
      setFormData(prev => ({ ...prev, email: validation.sanitizedText }));
    } else {
      setValidationErrors(prev => ({ 
        ...prev, 
        email: validation.errors[0] || 'Invalid email format'
      }));
      setFormData(prev => ({ ...prev, email: validation.sanitizedText }));
    }
  }
};
```

#### Form Submission Prevention
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Check if there are any validation errors
  if (hasValidationErrors) {
    return;
  }
  
  // Final validation before submission
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    setValidationErrors(prev => ({ 
      ...prev, 
      email: emailValidation.errors[0] || 'Invalid email format'
    }));
    setHasValidationErrors(true);
    return;
  }
  
  // Proceed with submission only if validation passes
  const success = await signIn(formData.email, formData.password);
};
```

## FullPageStoryInput Component Security

### Real-time Validation

The `FullPageStoryInput` component implements real-time security validation:

1. **Input Monitoring**: Every keystroke is validated for security threats
2. **Immediate Feedback**: Users see security warnings in real-time
3. **Automatic Sanitization**: Malicious content is automatically removed
4. **Translation Prevention**: Translation is blocked until security issues are resolved

### User Experience Features

#### Security Warning Display

When malicious content is detected:
- Red warning banner appears below the input
- Clear explanation of the security issue
- Assurance that content has been automatically sanitized
- Guidance on how to fix the input

#### Graceful Degradation

- Users can continue editing even with security warnings
- Sanitized content is preserved for editing
- Translation is only blocked when active threats are present

### Implementation Details

```typescript
const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  const rawValue = event.target.value;
  
  // Validate and sanitize the input
  const validation = validateStoryText(rawValue);
  
  if (validation.isValid) {
    setValidationError(null);
    onChange(validation.sanitizedText);
  } else {
    setValidationError(validation.errors[0]);
    onChange(validation.sanitizedText); // Still use sanitized version
  }
};
```

## Testing Strategy

### Comprehensive Test Coverage

The security features are thoroughly tested with:

1. **Unit Tests**: `src/lib/utils/__tests__/sanitization.test.ts`
   - 31 test cases covering all sanitization scenarios
   - Edge cases and performance testing
   - Security threat simulation

2. **Authentication Sanitization Tests**: `src/lib/utils/__tests__/sanitization.auth.test.ts`
   - 35 test cases for email, username, and display name validation
   - Format validation and security threat detection
   - Length limits and edge case handling

3. **Story Input Component Tests**: `src/components/story/__tests__/FullPageStoryInput.security.test.tsx`
   - 13 test cases for component security features
   - User interaction testing
   - Real-time validation testing

4. **Authentication Form Security Tests**: 
   - `src/components/auth/__tests__/SignInForm.security.test.tsx` (13 tests)
   - `src/components/auth/__tests__/SignUpForm.security.test.tsx` (20 tests)
   - Form submission prevention and validation error handling
   - Real-time input sanitization and user feedback

5. **Backend Validation Tests**: `src/api/supabase/database/__tests__/userService.test.ts`
   - 25 test cases for backend user data validation and sanitization
   - Input validation for user creation and updates
   - Business logic validation (username uniqueness, format requirements)
   - Error handling and database operation security
   - Comprehensive coverage of all user service methods

### Test Categories

#### Sanitization Tests
- Null/undefined input handling
- HTML tag stripping
- Script tag removal
- Event handler detection
- Length limit enforcement

#### Security Threat Tests
- XSS script injection attempts
- JavaScript protocol attacks
- Event handler injection
- Data URL attacks
- Complex nested attacks

#### User Experience Tests
- Normal text handling
- Special character preservation
- Warning display and clearing
- Translation prevention

## Performance Considerations

### Efficient Processing

- **Lazy Evaluation**: Validation only runs when input changes
- **Optimized Patterns**: Efficient regex patterns for threat detection
- **Length Limits**: Prevents resource exhaustion from extremely large inputs
- **Memory Management**: Proper cleanup of sanitized content

### Scalability

- **Configurable Limits**: Adjustable maximum input lengths
- **Modular Design**: Easy to extend with new security rules
- **Reusable Components**: Sanitization utilities can be used across the app

## Best Practices

### For Developers

1. **Always Use Sanitization**: Never trust user input directly
2. **Test Security Features**: Run security tests before deployment
3. **Monitor for New Threats**: Keep security patterns updated
4. **Document Changes**: Update this document when adding new security features

### For Users

1. **Trust the Warnings**: Security warnings indicate real threats
2. **Follow Guidance**: Fix input when security issues are detected
3. **Report Issues**: Contact support if legitimate content is blocked

## Future Enhancements

### Planned Security Features

1. **Content Security Policy (CSP)**: Additional browser-level protection
2. **Rate Limiting**: Prevent abuse through excessive input
3. **Advanced Threat Detection**: Machine learning-based threat detection
4. **Audit Logging**: Track security events for analysis

### Monitoring and Analytics

1. **Security Event Tracking**: Monitor blocked threats
2. **Performance Metrics**: Track sanitization performance
3. **User Feedback**: Collect feedback on false positives

## Compliance and Standards

### OWASP Guidelines

The security implementation follows OWASP (Open Web Application Security Project) guidelines:

- **A03:2021 - Injection**: Prevented through input sanitization
- **A07:2021 - Identification and Authentication Failures**: Not applicable to public input
- **A08:2021 - Software and Data Integrity Failures**: Prevented through validation

### Industry Standards

- **DOMPurify**: Industry-standard HTML sanitization library
- **Content Security Policy**: Planned implementation
- **Secure Coding Practices**: Following TypeScript/React best practices

## Conclusion

The StoryLearnerAI application implements robust security measures to protect users from common web vulnerabilities. The multi-layered approach ensures that malicious content is detected and prevented while maintaining a smooth user experience.

The security system is designed to be:
- **Comprehensive**: Covers all major threat vectors
- **User-friendly**: Provides clear feedback and guidance
- **Performant**: Efficient processing without impacting user experience
- **Maintainable**: Well-tested and documented code
- **Extensible**: Easy to add new security features as needed

For questions or concerns about security features, please refer to the test files or contact the development team. 