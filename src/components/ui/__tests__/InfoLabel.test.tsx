import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { InfoLabel } from '../InfoLabel';

describe('InfoLabel Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default props', () => {
    const { container } = render(<InfoLabel>Test Label</InfoLabel>);
    
    const label = within(container).getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('bg-green-100', 'text-green-700'); // success variant
    expect(label).toHaveClass('text-sm', 'px-2.5', 'py-0.5'); // default size
  });

  it('renders with success variant', () => {
    const { container } = render(
      <InfoLabel variant="success">Success Label</InfoLabel>
    );
    
    const label = within(container).getByText('Success Label');
    expect(label).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('renders with info variant', () => {
    const { container } = render(
      <InfoLabel variant="info">Info Label</InfoLabel>
    );
    
    const label = within(container).getByText('Info Label');
    expect(label).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('renders with warning variant', () => {
    const { container } = render(
      <InfoLabel variant="warning">Warning Label</InfoLabel>
    );
    
    const label = within(container).getByText('Warning Label');
    expect(label).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('renders with destructive variant', () => {
    const { container } = render(
      <InfoLabel variant="destructive">Error Label</InfoLabel>
    );
    
    const label = within(container).getByText('Error Label');
    expect(label).toHaveClass('bg-destructive', 'text-destructive-foreground');
  });

  it('renders with default variant', () => {
    const { container } = render(
      <InfoLabel variant="default">Default Label</InfoLabel>
    );
    
    const label = within(container).getByText('Default Label');
    expect(label).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders with secondary variant', () => {
    const { container } = render(
      <InfoLabel variant="secondary">Secondary Label</InfoLabel>
    );
    
    const label = within(container).getByText('Secondary Label');
    expect(label).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders with outline variant', () => {
    const { container } = render(
      <InfoLabel variant="outline">Outline Label</InfoLabel>
    );
    
    const label = within(container).getByText('Outline Label');
    expect(label).toHaveClass('text-foreground');
  });

  it('renders with different sizes', () => {
    const { container: smallContainer } = render(
      <InfoLabel size="sm">Small Label</InfoLabel>
    );
    const { container: defaultContainer } = render(
      <InfoLabel size="default">Default Label</InfoLabel>
    );
    const { container: largeContainer } = render(
      <InfoLabel size="lg">Large Label</InfoLabel>
    );
    
    const smallLabel = within(smallContainer).getByText('Small Label');
    const defaultLabel = within(defaultContainer).getByText('Default Label');
    const largeLabel = within(largeContainer).getByText('Large Label');
    
    expect(smallLabel).toHaveClass('text-xs', 'px-2', 'py-0.5');
    expect(defaultLabel).toHaveClass('text-sm', 'px-2.5', 'py-0.5');
    expect(largeLabel).toHaveClass('text-sm', 'px-3', 'py-1');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    const { container } = render(
      <InfoLabel ref={ref}>Ref Label</InfoLabel>
    );
    
    const label = within(container).getByText('Ref Label');
    expect(ref).toHaveBeenCalledWith(label);
  });

  it('supports custom className', () => {
    const { container } = render(
      <InfoLabel className="custom-class">Custom Label</InfoLabel>
    );
    
    const label = within(container).getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
  });

  it('renders as span element', () => {
    const { container } = render(<InfoLabel>Span Label</InfoLabel>);
    
    const label = within(container).getByText('Span Label');
    expect(label.tagName).toBe('SPAN');
  });

  it('has proper base styling classes', () => {
    const { container } = render(<InfoLabel>Styled Label</InfoLabel>);
    
    const label = within(container).getByText('Styled Label');
    expect(label).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-md',
      'border',
      'font-semibold',
      'transition-colors',
      'whitespace-nowrap'
    );
  });

  it('supports custom HTML attributes', () => {
    const { container } = render(
      <InfoLabel data-testid="custom-label" title="Tooltip text">
        Custom Attr Label
      </InfoLabel>
    );
    
    const label = within(container).getByText('Custom Attr Label');
    expect(label).toHaveAttribute('data-testid', 'custom-label');
    expect(label).toHaveAttribute('title', 'Tooltip text');
  });

  it('combines variant and size classes correctly', () => {
    const { container } = render(
      <InfoLabel variant="info" size="lg">Large Info</InfoLabel>
    );
    
    const label = within(container).getByText('Large Info');
    expect(label).toHaveClass('bg-blue-100', 'text-blue-700', 'text-sm', 'px-3', 'py-1');
  });

  it('has focus styles for accessibility', () => {
    const { container } = render(<InfoLabel>Focusable Label</InfoLabel>);
    
    const label = within(container).getByText('Focusable Label');
    expect(label).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2');
  });
}); 