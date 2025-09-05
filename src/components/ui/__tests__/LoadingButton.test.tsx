import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { LoadingButton } from '../LoadingButton';

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton>Submit</LoadingButton>);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders spinner and loading text when loading', () => {
    render(
      <LoadingButton loading loadingText='Saving...'>
        Submit
      </LoadingButton>
    );
    const btn = screen.getByRole('button', { name: 'Saving...' });
    expect(btn).toBeDisabled();
    // spinner is a div with animate-spin classes
    const spinner = btn.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
