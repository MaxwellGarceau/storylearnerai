import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ContextSection } from '../ContextSection';

describe('ContextSection Component', () => {
  it('renders null when no context provided', () => {
    const { container } = render(<ContextSection />);
    expect(container.firstChild).toBeNull();
  });

  it('renders original and translated sections', () => {
    render(
      <ContextSection
        fromContext='Original text'
        targetContext='Translated text'
        data-testid='context'
      />
    );

    expect(screen.getByText('Context')).toBeInTheDocument();
    expect(screen.getByText('Original:')).toBeInTheDocument();
    expect(screen.getByText('Original text')).toBeInTheDocument();
    expect(screen.getByText('Translated:')).toBeInTheDocument();
    expect(screen.getByText('Translated text')).toBeInTheDocument();
  });
});
