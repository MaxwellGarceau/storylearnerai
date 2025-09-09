import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { WordDisplay } from '../WordDisplay';

describe('WordDisplay', () => {
  it('renders original and translated words', () => {
    render(<WordDisplay fromWord='hola' targetWord='hello' />);
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });
});
