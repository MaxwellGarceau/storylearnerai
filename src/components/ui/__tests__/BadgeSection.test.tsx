import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BadgeSection } from '../BadgeSection';

describe('BadgeSection Component', () => {
  it('renders null when no badges provided', () => {
    const { container } = render(
      <BadgeSection
        partOfSpeechKey={pos => `vocabulary.pos.${pos}`}
        frequencyKey={freq => `vocabulary.frequency.${freq}`}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders partOfSpeech and frequency badges', () => {
    render(
      <BadgeSection
        partOfSpeech='noun'
        frequencyLevel='common'
        partOfSpeechKey={pos => `vocabulary.pos.${pos}`}
        frequencyKey={freq => `vocabulary.frequency.${freq}`}
      />
    );

    expect(screen.getByText('vocabulary.pos.noun')).toBeInTheDocument();
    expect(screen.getByText('vocabulary.frequency.common')).toBeInTheDocument();
  });

  it('supports custom key mappers and className', () => {
    render(
      <BadgeSection
        className='custom-class'
        partOfSpeech='verb'
        partOfSpeechKey={pos => `POS:${pos}`}
        frequencyLevel='rare'
        frequencyKey={f => `FREQ:${f}`}
      />
    );

    const container = screen.getByText('POS:verb').parentElement;
    expect(container).toHaveClass('custom-class');
    expect(screen.getByText('FREQ:rare')).toBeInTheDocument();
  });
});
