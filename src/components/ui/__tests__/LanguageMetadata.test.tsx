import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { LanguageMetadata } from '../LanguageMetadata';

describe('LanguageMetadata', () => {
  it('renders language pair and date', () => {
    render(
      <LanguageMetadata
        fromLanguage='English'
        toLanguage='Español'
        createdAt='2024-01-01'
      />
    );
    expect(screen.getByText('English → Español')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });
});
