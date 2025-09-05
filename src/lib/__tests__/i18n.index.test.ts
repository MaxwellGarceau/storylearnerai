import { describe, expect, it } from 'vitest';

// Tests added by the assistant.

describe('i18n initialization', () => {
  it('initializes without throwing and exposes t function', async () => {
    const mod = await import('../i18n');
    const i18n = mod.default;
    expect(i18n).toBeDefined();
    expect(typeof i18n.t).toBe('function');
    // Basic translation presence
    expect(i18n.t('common.loading')).toBeTruthy();
  });
});
