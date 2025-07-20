import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { InfoButton } from '../InfoButton';

describe('InfoButton Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default props', () => {
    const { container } = render(<InfoButton>Test Button</InfoButton>);
    
    const button = within(container).getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-green-200', 'text-green-800'); // secondary variant
    expect(button).toHaveClass('h-8'); // sm size
  });

  it('renders with primary variant', () => {
    const { container } = render(
      <InfoButton variant="primary">Primary Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Primary Button' });
    expect(button).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('renders with secondary variant', () => {
    const { container } = render(
      <InfoButton variant="secondary">Secondary Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Secondary Button' });
    expect(button).toHaveClass('bg-green-200', 'text-green-800');
  });

  it('renders with outline variant', () => {
    const { container } = render(
      <InfoButton variant="outline">Outline Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Outline Button' });
    expect(button).toHaveClass('border', 'border-input');
  });

  it('renders with different sizes', () => {
    const { container: smallContainer } = render(
      <InfoButton size="sm">Small Button</InfoButton>
    );
    const { container: defaultContainer } = render(
      <InfoButton size="default">Default Button</InfoButton>
    );
    const { container: largeContainer } = render(
      <InfoButton size="lg">Large Button</InfoButton>
    );
    
    const smallButton = within(smallContainer).getByRole('button');
    const defaultButton = within(defaultContainer).getByRole('button');
    const largeButton = within(largeContainer).getByRole('button');
    
    expect(smallButton).toHaveClass('h-8', 'text-xs');
    expect(defaultButton).toHaveClass('h-9', 'text-sm');
    expect(largeButton).toHaveClass('h-11', 'text-base');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <InfoButton onClick={handleClick}>Clickable Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Clickable Button' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    const { container } = render(
      <InfoButton ref={ref}>Ref Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Ref Button' });
    expect(ref).toHaveBeenCalledWith(button);
  });

  it('can be disabled', () => {
    const { container } = render(
      <InfoButton disabled>Disabled Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('supports custom className', () => {
    const { container } = render(
      <InfoButton className="custom-class">Custom Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('supports asChild prop with Slot', () => {
    const { container } = render(
      <InfoButton asChild>
        <a href="/test">Link Button</a>
      </InfoButton>
    );
    
    const link = within(container).getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-green-200', 'text-green-800'); // Should have InfoButton styles
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(
      <InfoButton aria-label="Accessible button">Button</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Accessible button' });
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
    expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
  });

  it('combines variant and size classes correctly', () => {
    const { container } = render(
      <InfoButton variant="primary" size="lg">Large Primary</InfoButton>
    );
    
    const button = within(container).getByRole('button', { name: 'Large Primary' });
    expect(button).toHaveClass('bg-blue-100', 'text-blue-700', 'h-11', 'text-base');
  });
}); 