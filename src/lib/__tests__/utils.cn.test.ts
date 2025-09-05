import { describe, expect, it } from 'vitest';
import { cn } from '../utils';

// Tests added by the assistant.

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    const result = cn('p-2', 'text-sm', 'p-4', { hidden: false }, ['m-2']);
    // tailwind-merge keeps the latter padding class
    expect(result).toContain('p-4');
    expect(result).toContain('text-sm');
    expect(result).toContain('m-2');
    expect(result).not.toContain('p-2 ');
  });
});
