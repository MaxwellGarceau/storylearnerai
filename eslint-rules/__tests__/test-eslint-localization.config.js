import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import noNonLocalizedText from '../no-non-localized-text.js'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      testCustom: {
        rules: {
          'no-non-localized-text': noNonLocalizedText,
        },
      },
    },
    rules: {
      'testCustom/no-non-localized-text': ['warn', { 
        minLength: 3,
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
        ],
        allowedProps: [
          'className', 'id', 'data-testid', 'aria-label', 'title', 'alt', 'placeholder',
          'name', 'type', 'value', 'src', 'href', 'target', 'rel'
        ]
      }],
    },
  }
)
