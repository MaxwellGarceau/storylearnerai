import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import noDuplicateTypes from './eslint-rules/no-duplicate-types.js'
import noNonLocalizedText from './eslint-rules/no-non-localized-text.js'

export default tseslint.config(
  { ignores: ['dist', 'eslint-rules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'custom': {
        rules: {
          'no-duplicate-types': noDuplicateTypes,
          'no-non-localized-text': noNonLocalizedText,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
	  'indent': ['error', 2, { 'SwitchCase': 1 }], // Enforce 2 spaces, adjust as desired
      // Prevent direct console usage - enforce structured logging
      'no-console': ['error', { 
        allow: ['warn', 'error'] // Allow console.warn and console.error for critical errors only
      }],
      // Custom rule to suggest using logger instead
      'no-restricted-properties': [
        'error',
        {
          object: 'console',
          property: 'log',
          message: 'Use logger.info() instead of console.log() for structured logging'
        },
        {
          object: 'console',
          property: 'debug',
          message: 'Use logger.debug() instead of console.debug() for structured logging'
        },
        {
          object: 'console',
          property: 'info',
          message: 'Use logger.info() instead of console.info() for structured logging'
        }
      ],
      // Enforce consistent type organization
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      // Encourage type exports from dedicated files
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      // Enforce consistent naming conventions for interfaces and type aliases
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
      ],
      // TypeScript-specific rules for better type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for React components
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Too strict for React components
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      // Custom rule to prevent duplicate type definitions
      'custom/no-duplicate-types': ['warn', {
        ignoreTypes: [
          'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'null', 'undefined', 'Record',
          'LanguageCode', 'DifficultyLevel',
          // Common types
          'NullableString', 'NullableNumber', 'NullableBoolean',
          'PromiseResult', 'PromiseResultOrNull', 'PromiseVoid',
          'VoidCallback', 'AsyncVoidCallback',
          'RecordString', 'RecordUnknown',
          'TextAreaChangeEvent', 'InputChangeEvent',
          'ValidationResult',
          'AuthFunction', 'AuthCallback', 'AuthSuccessCallback', 'AuthErrorCallback',
          'DatabaseResponse', 'LanguageFilter', 'DifficultyFilter',
          // Additional common types
          'OptionalString', 'HTMLElementOrNull', 'ViMockFunction', 'AuthErrorOrString',
          'WalkthroughStateCallback', 'WalkthroughConfigOrNull', 'TranslationResponsePromise',
          'PromptInstructionsOrNull', 'RecordUnknownOrUndefined', 'LlamaMessage', 'LlamaMessageArray',
          'SaveFieldType', 'SupabaseEventCallback', 'SupabaseEventCallbackOrUndefined',
          // Database types
          'DatabaseInsertResult', 'DatabaseSelectResult', 'DatabaseUpdateResult', 'DatabaseDeleteResult',
          'SupabaseResponse', 'DatabaseId', 'DatabaseTimestamp', 'DatabaseNullableString', 'DatabaseNullableNumber',
          'DatabaseOperation', 'DatabaseOperationOrNull',
          'UserInsertResult', 'UserSelectResult', 'UserUpdateResult',
          'TranslationInsertResult', 'TranslationSelectResult', 'TranslationUpdateResult',
          'SavedTranslationResult'
        ],
        minComplexity: 2
      }],
      // Custom rule to prevent non-localized text
      'custom/no-non-localized-text': ['warn', {
        minLength: 3,
        ignorePatterns: [
          '^[A-Z_]+$', // Constants like ERROR, SUCCESS
          '^[a-z]+://', // URLs with protocols
          '^/[a-zA-Z0-9/?=&._-]*$', // Relative URLs starting with /
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
          'name', 'type', 'value', 'src', 'href', 'target', 'rel',
          'viewBox', 'fill', 'stroke', 'strokeLinecap', 'strokeLinejoin', 'strokeWidth', 'd'
        ]
      }]
    },
  },
  // Exclude ConsoleWrapper and test files from console restrictions
  {
    files: ['**/ConsoleWrapper.ts', '**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-console': 'off',
      'no-restricted-properties': 'off',
      // Relax some TypeScript rules for test files
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  // Node.js environment for scripts and config files
  {
    files: ['**/*.js', 'scripts/**/*', '*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  }
)
