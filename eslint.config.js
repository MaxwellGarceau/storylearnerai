import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
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
      ]
    },
  },
  // Exclude ConsoleWrapper and test files from console restrictions
  {
    files: ['**/ConsoleWrapper.ts', '**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-console': 'off',
      'no-restricted-properties': 'off'
    }
  }
)
