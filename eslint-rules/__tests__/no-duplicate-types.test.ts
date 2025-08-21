import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';

async function runLint(code: string) {
  const eslint = new ESLint({
    // Use the test-specific config
    overrideConfigFile: './eslint-rules/__tests__/test-eslint.config.js',
  });

  // Provide a .ts filename so TS parser engages
  const results = await eslint.lintText(code, { filePath: 'test.ts' });
  return results[0];
}

describe('custom/no-duplicate-types', () => {
  it('reports duplicate union type usages', async () => {
    const code = `
      const a: 'Cat' | 'Dog' = 'Cat';
      const b: 'Cat' | 'Dog' = 'Dog';
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(1);
    expect(messages[0].message).toContain("Duplicate type definition '");
  });

  it('reports duplicate union types with different member order', async () => {
    const code = `
      const a: 'Cat' | 'Dog' = 'Cat';
      const b: 'Dog' | 'Cat' = 'Dog';
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(1);
    expect(messages[0].message).toContain("Duplicate type definition '");
  });

  it('does not report when a reusable type alias is used', async () => {
    const code = `
      type Pet = 'Cat' | 'Dog'
      const a: Pet = 'Cat';
      const b: Pet = 'Dog';
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(0);
  });

  it('reports duplicate object literal types', async () => {
    const code = `
      const x: { a: string; b: number } = { a: '1', b: 2 };
      const y: { a: string; b: number } = { a: '3', b: 4 };
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(1);
  });

  it('reports duplicate function types', async () => {
    const code = `
      const f: () => void = () => {};
      const g: () => void = () => {};
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(1);
  });

  it('does not report duplicate Record types', async () => {
    const code = `
      const x: Record<string, string> = { a: '1', b: '2' };
      const y: Record<string, string> = { c: '3', d: '4' };
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-duplicate-types'
    );
    expect(messages.length).toBe(0);
  });
});
