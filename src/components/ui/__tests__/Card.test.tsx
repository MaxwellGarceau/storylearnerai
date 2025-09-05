import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../Card';

describe('Card Component', () => {
  it('renders card structure with header, title, description and content', () => {
    render(
      <Card data-testid='card' variant='outline'>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content</p>
        </CardContent>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(card).toHaveClass('border');
  });
});
