import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import Label from '../Label';

describe('Label Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with required props', () => {
    const { container } = render(
      <Label htmlFor="test-input">Test Label</Label>
    );
    
    const label = within(container).getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('sets correct htmlFor attribute', () => {
    const { container } = render(
      <Label htmlFor="email-input">Email Address</Label>
    );
    
    const label = within(container).getByText('Email Address');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders children correctly', () => {
    const { container } = render(
      <Label htmlFor="complex-input">
        <span>Complex</span> Label Content
      </Label>
    );
    
    // Check that the label exists and has correct content
    const label = within(container).getByText('Complex');
    expect(label).toBeInTheDocument();
    expect(within(container).getByText('Label Content')).toBeInTheDocument();
    
    // Check that it has the correct htmlFor attribute
    const labelElement = container.querySelector('label');
    expect(labelElement).toHaveAttribute('for', 'complex-input');
  });

  it('has correct styling classes', () => {
    const { container } = render(
      <Label htmlFor="styled-input">Styled Label</Label>
    );
    
    const label = within(container).getByText('Styled Label');
    expect(label).toHaveClass(
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700'
    );
  });

  it('works with form input association', () => {
    const { container } = render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>
    );
    
    const label = within(container).getByText('Username');
    const input = within(container).getByLabelText('Username');
    
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
    expect(input).toBeInTheDocument();
  });

  it('supports text content', () => {
    const { container } = render(
      <Label htmlFor="simple">Simple Text</Label>
    );
    
    const label = within(container).getByText('Simple Text');
    expect(label.textContent).toBe('Simple Text');
  });

  it('renders with different htmlFor values', () => {
    const { container } = render(
      <div>
        <Label htmlFor="first-name">First Name</Label>
        <Label htmlFor="last-name">Last Name</Label>
        <Label htmlFor="email">Email</Label>
      </div>
    );
    
    const firstNameLabel = within(container).getByText('First Name');
    const lastNameLabel = within(container).getByText('Last Name');
    const emailLabel = within(container).getByText('Email');
    
    expect(firstNameLabel).toHaveAttribute('for', 'first-name');
    expect(lastNameLabel).toHaveAttribute('for', 'last-name');
    expect(emailLabel).toHaveAttribute('for', 'email');
  });

  it('maintains accessibility with screen readers', () => {
    const { container } = render(
      <div>
        <Label htmlFor="accessible-input">Accessible Field</Label>
        <input id="accessible-input" type="text" />
      </div>
    );
    
    // The label should be accessible by its text
    const labelByText = within(container).getByText('Accessible Field');
    expect(labelByText).toBeInTheDocument();
    
    // The input should be accessible by the label text
    const inputByLabel = within(container).getByLabelText('Accessible Field');
    expect(inputByLabel).toBeInTheDocument();
    
    // They should be properly associated
    expect(labelByText).toHaveAttribute('for', 'accessible-input');
    expect(inputByLabel).toHaveAttribute('id', 'accessible-input');
  });
}); 