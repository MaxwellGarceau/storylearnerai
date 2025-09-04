import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthPrompt } from '../AuthPrompt';
import type { TFunction } from 'i18next';

// Mock the TFunction type
const mockT: TFunction = ((key: string) => {
  const translations: Record<string, string> = {
    'wordMenu.guest.message':
      'Create a free account to translate words, open the dictionary, and save vocabulary to your library.',
    'wordMenu.guest.cta': 'Sign up to get started',
    'navigation.signIn': 'Log In',
  };
  return translations[key] || key;
}) as TFunction;

// Wrapper component to provide router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AuthPrompt', () => {
  describe('Button variant', () => {
    it('renders the guest message and both sign in and sign up buttons', () => {
      render(
        <TestWrapper>
          <AuthPrompt t={mockT} variant='button' />
        </TestWrapper>
      );

      expect(
        screen.getByText(
          'Create a free account to translate words, open the dictionary, and save vocabulary to your library.'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Sign up to get started' })
      ).toBeInTheDocument();
    });

    it('has correct links for sign in and sign up', () => {
      render(
        <TestWrapper>
          <AuthPrompt t={mockT} variant='button' />
        </TestWrapper>
      );

      const signInLink = screen.getByRole('link', { name: 'Log In' });
      const signUpLink = screen.getByRole('link', {
        name: 'Sign up to get started',
      });

      expect(signInLink).toHaveAttribute('href', '/auth?mode=signin');
      expect(signUpLink).toHaveAttribute('href', '/auth?mode=signup');
    });
  });

  describe('Link variant', () => {
    it('renders the guest message and both sign in and sign up links', () => {
      render(
        <TestWrapper>
          <AuthPrompt t={mockT} variant='link' />
        </TestWrapper>
      );

      expect(
        screen.getByText(
          'Create a free account to translate words, open the dictionary, and save vocabulary to your library.'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Sign up to get started' })
      ).toBeInTheDocument();
    });

    it('has correct links for sign in and sign up', () => {
      render(
        <TestWrapper>
          <AuthPrompt t={mockT} variant='link' />
        </TestWrapper>
      );

      const signInLink = screen.getByRole('link', { name: 'Log In' });
      const signUpLink = screen.getByRole('link', {
        name: 'Sign up to get started',
      });

      expect(signInLink).toHaveAttribute('href', '/auth?mode=signin');
      expect(signUpLink).toHaveAttribute('href', '/auth?mode=signup');
    });

    it('renders sign in link below sign up link', () => {
      render(
        <TestWrapper>
          <AuthPrompt t={mockT} variant='link' />
        </TestWrapper>
      );

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Sign up link should come first, then sign in link
      expect(links[0]).toHaveTextContent('Sign up to get started');
      expect(links[1]).toHaveTextContent('Log In');
    });
  });

  describe('Custom className props', () => {
    it('applies custom container className', () => {
      render(
        <TestWrapper>
          <AuthPrompt
            t={mockT}
            variant='button'
            containerClassName='custom-container'
          />
        </TestWrapper>
      );

      const container = screen.getByText(
        'Create a free account to translate words, open the dictionary, and save vocabulary to your library.'
      ).parentElement;
      expect(container).toHaveClass('custom-container');
    });

    it('applies custom message className', () => {
      render(
        <TestWrapper>
          <AuthPrompt
            t={mockT}
            variant='button'
            messageClassName='custom-message'
          />
        </TestWrapper>
      );

      const message = screen.getByText(
        'Create a free account to translate words, open the dictionary, and save vocabulary to your library.'
      );
      expect(message).toHaveClass('custom-message');
    });
  });
});
