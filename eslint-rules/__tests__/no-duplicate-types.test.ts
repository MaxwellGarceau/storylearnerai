import { describe, it, expect } from 'vitest'
import { ESLint } from 'eslint'
// Import the rule module directly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JS module
import noDuplicateTypesRule from '../no-duplicate-types.js'

async function runLint(code: string) {
  const tsParser = await import('@typescript-eslint/parser')
  const parser = (tsParser as any).default ?? tsParser

  const eslint = new ESLint({
    overrideConfig: {
      languageOptions: {
        parser,
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
      },
      plugins: {
        testCustom: {
          rules: {
            'no-duplicate-types': noDuplicateTypesRule as any,
          },
        },
      },
      rules: {
        'testCustom/no-duplicate-types': ['warn', { minComplexity: 2 }],
      },
    },
  })

  // Provide a .ts filename so TS parser engages
  const results = await eslint.lintText(code, { filePath: 'test.ts' })
  return results[0]
}

describe('custom/no-duplicate-types', () => {
  it('reports duplicate union type usages', async () => {
    const code = `
      const a: 'Cat' | 'Dog' = 'Cat';
      const b: 'Cat' | 'Dog' = 'Dog';
    `

    const result = await runLint(code)
    const messages = result.messages.filter(m => m.ruleId === 'testCustom/no-duplicate-types')
    expect(messages.length).toBe(1)
    expect(messages[0].message).toContain("Duplicate type definition '")
  })

  it('reports duplicate union types with different member order', async () => {
    const code = `
      const a: 'Cat' | 'Dog' = 'Cat';
      const b: 'Dog' | 'Cat' = 'Dog';
    `

    const result = await runLint(code)
    const messages = result.messages.filter(m => m.ruleId === 'testCustom/no-duplicate-types')
    expect(messages.length).toBe(1)
    expect(messages[0].message).toContain("Duplicate type definition '")
  })

  it('does not report when a reusable type alias is used', async () => {
    const code = `
      type Pet = 'Cat' | 'Dog'
      const a: Pet = 'Cat';
      const b: Pet = 'Dog';
    `

    const result = await runLint(code)
    const messages = result.messages.filter(m => m.ruleId === 'testCustom/no-duplicate-types')
    expect(messages.length).toBe(0)
  })

  it('reports duplicate object literal types', async () => {
    const code = `
      const x: { a: string; b: number } = { a: '1', b: 2 };
      const y: { a: string; b: number } = { a: '3', b: 4 };
    `

    const result = await runLint(code)
    const messages = result.messages.filter(m => m.ruleId === 'testCustom/no-duplicate-types')
    expect(messages.length).toBe(1)
  })

  it('reports duplicate function types', async () => {
    const code = `
      const f: () => void = () => {};
      const g: () => void = () => {};
    `

    const result = await runLint(code)
    const messages = result.messages.filter(m => m.ruleId === 'testCustom/no-duplicate-types')
    expect(messages.length).toBe(1)
  })
})
