import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Button } from '../Button';

describe('Button Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default props', () => {
    const { container } = render(<Button>Test Button</Button>);

    const button = within(container).getByRole('button', {
      name: 'Test Button',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground'); // default variant
    expect(button).toHaveClass('h-10', 'px-4', 'py-2'); // default size
  });

  it('renders with default variant', () => {
    const { container } = render(
      <Button variant='default'>Default Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Default Button',
    });
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders with destructive variant', () => {
    const { container } = render(
      <Button variant='destructive'>Destructive Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Destructive Button',
    });
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
  });

  it('renders with outline variant', () => {
    const { container } = render(
      <Button variant='outline'>Outline Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Outline Button',
    });
    expect(button).toHaveClass('border', 'border-input', 'bg-background');
  });

  it('renders with secondary variant', () => {
    const { container } = render(
      <Button variant='secondary'>Secondary Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Secondary Button',
    });
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant='ghost'>Ghost Button</Button>);

    const button = within(container).getByRole('button', {
      name: 'Ghost Button',
    });
    expect(button).toHaveClass(
      'hover:bg-accent',
      'hover:text-accent-foreground'
    );
  });

  it('renders with link variant', () => {
    const { container } = render(<Button variant='link'>Link Button</Button>);

    const button = within(container).getByRole('button', {
      name: 'Link Button',
    });
    expect(button).toHaveClass('text-primary', 'underline-offset-4');
  });

  it('renders with different sizes', () => {
    const { container: defaultContainer } = render(
      <Button size='default'>Default Size</Button>
    );
    const { container: smallContainer } = render(
      <Button size='sm'>Small Size</Button>
    );
    const { container: largeContainer } = render(
      <Button size='lg'>Large Size</Button>
    );
    const { container: iconContainer } = render(
      <Button size='icon'>Icon</Button>
    );

    const defaultButton = within(defaultContainer).getByRole('button');
    const smallButton = within(smallContainer).getByRole('button');
    const largeButton = within(largeContainer).getByRole('button');
    const iconButton = within(iconContainer).getByRole('button');

    expect(defaultButton).toHaveClass('h-10', 'px-4', 'py-2');
    expect(smallButton).toHaveClass('h-9', 'px-3');
    expect(largeButton).toHaveClass('h-11', 'px-8');
    expect(iconButton).toHaveClass('h-10', 'w-10');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Button onClick={handleClick}>Clickable Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Clickable Button',
    });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    const { container } = render(<Button ref={ref}>Ref Button</Button>);

    const button = within(container).getByRole('button', {
      name: 'Ref Button',
    });
    expect(ref).toHaveBeenCalledWith(button);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Disabled Button',
    });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:opacity-50'
    );

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports custom className', () => {
    const { container } = render(
      <Button className='custom-class'>Custom Button</Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Custom Button',
    });
    expect(button).toHaveClass('custom-class');
  });

  it('supports asChild prop with Slot', () => {
    const { container } = render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>
    );

    const link = within(container).getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary', 'text-primary-foreground'); // Should have Button styles
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(
      <Button aria-label='Accessible button' type='submit'>
        Submit
      </Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Accessible button',
    });
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2'
    );
  });

  it('has proper base styling classes', () => {
    const { container } = render(<Button>Styled Button</Button>);

    const button = within(container).getByRole('button', {
      name: 'Styled Button',
    });
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'whitespace-nowrap',
      'rounded-md',
      'text-sm',
      'font-medium',
      'transition-colors'
    );
  });

  it('combines variant and size classes correctly', () => {
    const { container } = render(
      <Button variant='secondary' size='lg'>
        Large Secondary
      </Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Large Secondary',
    });
    expect(button).toHaveClass(
      'bg-secondary',
      'text-secondary-foreground',
      'h-11',
      'px-8'
    );
  });

  it('supports custom HTML button attributes', () => {
    const { container } = render(
      <Button type='submit' form='test-form' data-testid='submit-btn'>
        Submit Form
      </Button>
    );

    const button = within(container).getByRole('button', {
      name: 'Submit Form',
    });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'test-form');
    expect(button).toHaveAttribute('data-testid', 'submit-btn');
  });
});
