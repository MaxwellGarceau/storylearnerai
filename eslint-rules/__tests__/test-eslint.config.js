import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import noDuplicateTypes from '../no-duplicate-types.js'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        // Don't use project references for test files
      },
    },
    plugins: {
      testCustom: {
        rules: {
          'no-duplicate-types': noDuplicateTypes,
        },
      },
    },
    rules: {
      'testCustom/no-duplicate-types': ['warn', { minComplexity: 1 }],
    },
  }
)
