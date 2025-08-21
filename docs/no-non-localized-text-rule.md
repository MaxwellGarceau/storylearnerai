# No Non-Localized Text ESLint Rule

## Overview

The `custom/no-non-localized-text` ESLint rule prevents hardcoded text in React components that should be localized using `react-i18next`. This rule helps ensure consistent internationalization across the application.

## How It Works

The rule detects non-localized text in React components by:

1. **Checking for `useTranslation` import**: Only applies to components that import `useTranslation` from `react-i18next`
2. **Scanning JSX content**: Identifies hardcoded strings in JSX text nodes
3. **Checking JSX attributes**: Flags non-localized text in attribute values (except allowed props)
4. **Analyzing JSX expressions**: Detects string literals in JSX expressions

## Configuration

The rule can be configured with the following options:

```javascript
'custom/no-non-localized-text': ['warn', {
  minLength: 3, // Minimum string length to trigger the rule
  ignorePatterns: [
    '^[A-Z_]+$', // Constants like ERROR, SUCCESS
    '^[a-z]+://', // URLs
    '^[0-9]+$', // Numbers
    '^[0-9]+\\.[0-9]+$', // Decimal numbers
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // Email addresses
    '^[a-zA-Z0-9._-]+$', // Technical identifiers
    '^[\\s\\S]*<[^>]*>[\\s\\S]*$', // HTML-like content
    '^[\\s\\S]*\\{[^}]*\\}[\\s\\S]*$', // Template literals with variables
    '^[\\s\\S]*\\([^)]*\\)[\\s\\S]*$', // Function calls
    '^[\\s\\S]*\\.[a-zA-Z]+[\\s\\S]*$', // Method calls
    '^[0-9\\s]+$', // SVG viewBox values
    '^[MLHVCSQTAZmlhvcsqtaz0-9\\s.-]+$', // SVG path data
  ],
  allowedProps: [
    'className', 'id', 'data-testid', 'aria-label', 'title', 'alt', 'placeholder',
    'name', 'type', 'value', 'src', 'href', 'target', 'rel',
    'viewBox', 'fill', 'stroke', 'strokeLinecap', 'strokeLinejoin', 'strokeWidth', 'd'
  ]
}]
```

## Examples

### ❌ Non-Localized Text (Will be flagged)

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <div>Hello World</div>; // ❌ Non-localized text
}
```

### ✅ Properly Localized Text

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <div>{t('helloWorld')}</div>; // ✅ Localized text
}
```

### ✅ Allowed Cases

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return (
    <div>
      <div>Hi</div> {/* ✅ Short strings (below minLength) */}
      <div className='container'>Content</div> {/* ✅ Technical identifiers */}
      <div>123</div> {/* ✅ Numbers */}
      <a href='https://example.com'>Link</a> {/* ✅ URLs */}
      <input placeholder='Enter text' /> {/* ✅ Allowed props */}
    </div>
  );
}
```

### ✅ No useTranslation Import

```tsx
function Component() {
  return <div>This is fine without useTranslation</div>; // ✅ No useTranslation import
}
```

## Auto-Fix Suggestions

The rule provides auto-fix suggestions that:

1. **Generate translation keys**: Converts text to camelCase keys
2. **Replace with t() calls**: Suggests the correct `t()` function call
3. **Maintain context**: Preserves the original structure

Example suggestion:

```
Non-localized text 'Hello World' found. Use t('helloWorld') from react-i18next instead.
```

## Best Practices

1. **Use descriptive keys**: Choose meaningful translation keys that reflect the content
2. **Group related keys**: Organize translation keys hierarchically (e.g., `common.buttons.save`)
3. **Add translations**: Always add corresponding entries to your translation files
4. **Test with multiple languages**: Verify that translations work correctly in all supported languages

## Integration with Translation Files

When the rule suggests a translation key, add it to your translation files:

```json
// en.json
{
  "helloWorld": "Hello World",
  "welcomeMessage": "Welcome to our application"
}

// es.json
{
  "helloWorld": "Hola Mundo",
  "welcomeMessage": "Bienvenido a nuestra aplicación"
}
```

## Troubleshooting

### False Positives

If the rule flags text that should be ignored:

1. **Add to ignorePatterns**: Include regex patterns for technical strings
2. **Add to allowedProps**: Include props that should contain non-localized text
3. **Adjust minLength**: Increase the minimum length if short strings are being flagged

### Missing useTranslation Import

If you want to use the rule but haven't imported `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  // Now the rule will apply
}
```

## Related Rules

- `custom/no-duplicate-types`: Prevents duplicate type definitions
- Standard ESLint rules for React and TypeScript

## Testing

The rule includes comprehensive tests covering:

- Valid cases (properly localized text)
- Invalid cases (non-localized text)
- Edge cases (short strings, technical identifiers)
- Configuration options

Run tests with:

```bash
npm run test:once eslint-rules/__tests__/no-non-localized-text.test.ts
```
