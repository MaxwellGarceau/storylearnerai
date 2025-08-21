import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';

async function runLint(code: string) {
  const eslint = new ESLint({
    // Use the test-specific config
    overrideConfigFile:
      './eslint-rules/__tests__/test-eslint-localization.config.js',
  });

  // Provide a .tsx filename so TS parser engages
  const results = await eslint.lintText(code, { filePath: 'test.tsx' });
  return results[0];
}

describe('custom/no-non-localized-text', () => {
  it('allows using t() function', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div>{t('hello')}</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows short strings (below minLength)', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div>Hi</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows technical identifiers', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div className="container">Content</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows numbers', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div>123</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows URLs', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <a href="https://example.com">Link</a>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows allowed props', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <input placeholder="Enter text" />;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('allows non-localized text when useTranslation is not imported', async () => {
    const code = `
      function Component() {
        return <div>This is fine without useTranslation</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(0);
  });

  it('reports non-localized text in JSX', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div>Hello World</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(1);
    expect(messages[0].message).toContain(
      "Non-localized text 'Hello World' found"
    );
  });

  it('reports non-localized text in JSX attribute', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <button aria-describedby="description">Click me</button>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(1);
    expect(messages[0].message).toContain(
      "Non-localized text 'Click me' found"
    );
  });

  it('reports non-localized text in JSX expression', async () => {
    const code = `
      import { useTranslation } from 'react-i18next';
      
      function Component() {
        const { t } = useTranslation();
        return <div>{"Welcome to our app"}</div>;
      }
    `;

    const result = await runLint(code);
    const messages = result.messages.filter(
      m => m.ruleId === 'testCustom/no-non-localized-text'
    );
    expect(messages.length).toBe(1);
    expect(messages[0].message).toContain(
      "Non-localized text 'Welcome to our app' found"
    );
  });
});
