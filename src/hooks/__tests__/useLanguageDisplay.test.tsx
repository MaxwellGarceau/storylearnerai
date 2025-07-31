import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLanguageDisplay } from '../useLanguageDisplay';

describe('useLanguageDisplay', () => {
  it('should return a function to get language names', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    
    expect(result.current.getLanguageName).toBeDefined();
    expect(typeof result.current.getLanguageName).toBe('function');
  });

  it('should convert common language codes to display names', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    const { getLanguageName } = result.current;

    expect(getLanguageName('en')).toBe('English');
    expect(getLanguageName('es')).toBe('Spanish');
    expect(getLanguageName('fr')).toBe('French');
    expect(getLanguageName('de')).toBe('German');
    expect(getLanguageName('it')).toBe('Italian');
    expect(getLanguageName('pt')).toBe('Portuguese');
    expect(getLanguageName('ru')).toBe('Russian');
    expect(getLanguageName('ja')).toBe('Japanese');
    expect(getLanguageName('ko')).toBe('Korean');
    expect(getLanguageName('zh')).toBe('Chinese');
  });

  it('should handle case insensitive language codes', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    const { getLanguageName } = result.current;

    expect(getLanguageName('EN')).toBe('English');
    expect(getLanguageName('Es')).toBe('Spanish');
    expect(getLanguageName('FR')).toBe('French');
  });

  it('should return uppercase code for unknown language codes', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    const { getLanguageName } = result.current;

    expect(getLanguageName('xyz')).toBe('XYZ');
    expect(getLanguageName('unknown')).toBe('UNKNOWN');
    expect(getLanguageName('test123')).toBe('TEST123');
  });

  it('should handle empty string', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    const { getLanguageName } = result.current;

    expect(getLanguageName('')).toBe('');
  });

  it('should handle more language codes', () => {
    const { result } = renderHook(() => useLanguageDisplay());
    const { getLanguageName } = result.current;

    expect(getLanguageName('ar')).toBe('Arabic');
    expect(getLanguageName('hi')).toBe('Hindi');
    expect(getLanguageName('nl')).toBe('Dutch');
    expect(getLanguageName('sv')).toBe('Swedish');
    expect(getLanguageName('no')).toBe('Norwegian');
    expect(getLanguageName('da')).toBe('Danish');
    expect(getLanguageName('fi')).toBe('Finnish');
    expect(getLanguageName('pl')).toBe('Polish');
    expect(getLanguageName('tr')).toBe('Turkish');
    expect(getLanguageName('he')).toBe('Hebrew');
  });
}); 