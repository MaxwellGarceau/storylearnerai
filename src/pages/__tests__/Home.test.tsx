import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../Home';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
  };
});

// Mock the Layout component
vi.mock('../../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the useSupabase hook
vi.mock('../../hooks/useSupabase', () => ({
  useSupabase: () => ({
    user: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('Home', () => {
  it('renders the main heading', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders the description text', () => {
    renderWithRouter(<Home />);
    
    const descriptions = screen.getAllByText(/Transform any story into a powerful learning tool/);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('renders the "Why Choose Story Learner AI?" section', () => {
    renderWithRouter(<Home />);
    
    const sections = screen.getAllByText('Why Choose Story Learner AI?');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('renders the "How It Works" section', () => {
    renderWithRouter(<Home />);
    
    const sections = screen.getAllByText('How It Works');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('renders the start translating button', () => {
    renderWithRouter(<Home />);
    
    const startButtons = screen.getAllByText('Start Translating');
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('renders the sign up free button when user is not authenticated', () => {
    renderWithRouter(<Home />);
    
    const signUpButtons = screen.getAllByText('Sign Up Free');
    expect(signUpButtons.length).toBeGreaterThan(0);
  });

  it('renders the badge with AI-Powered Language Learning text', () => {
    renderWithRouter(<Home />);
    
    const badges = screen.getAllByText('AI-Powered Language Learning');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders feature cards with proper content', () => {
    renderWithRouter(<Home />);
    
    const multiLanguageElements = screen.getAllByText('Multi-Language Support');
    expect(multiLanguageElements[0]).toBeInTheDocument();
    
    const sideBySideElements = screen.getAllByText('Side-by-Side Reading');
    expect(sideBySideElements[0]).toBeInTheDocument();
    
    const learningInsightsElements = screen.getAllByText('Learning Insights');
    expect(learningInsightsElements[0]).toBeInTheDocument();
    
    const aiPoweredElements = screen.getAllByText('AI-Powered');
    expect(aiPoweredElements[0]).toBeInTheDocument();
  });

  it('renders step cards with proper content', () => {
    renderWithRouter(<Home />);
    
    const uploadElements = screen.getAllByText('Upload Your Story');
    expect(uploadElements[0]).toBeInTheDocument();
    
    const aiTranslationElements = screen.getAllByText('AI Translation');
    expect(aiTranslationElements[0]).toBeInTheDocument();
    
    const learnPracticeElements = screen.getAllByText('Learn & Practice');
    expect(learnPracticeElements[0]).toBeInTheDocument();
  });

  it('renders the CTA section', () => {
    renderWithRouter(<Home />);
    
    const ctaElements = screen.getAllByText('Ready to Start Your Language Learning Journey?');
    expect(ctaElements[0]).toBeInTheDocument();
    
    const createAccountElements = screen.getAllByText('Create Free Account');
    expect(createAccountElements[0]).toBeInTheDocument();
  });

  it('has proper container structure', () => {
    renderWithRouter(<Home />);
    
    const mainHeadings = screen.getAllByRole('heading', { level: 1, name: 'Story Learner AI' });
    const mainHeading = mainHeadings[0];
    const container = mainHeading.closest('.container');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-6xl');
  });

  it('has proper hero section styling', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    const mainHeading = headings.find(h => h.tagName === 'H1');
    const container = mainHeading?.closest('div');
    expect(container).toHaveClass('text-center', 'mb-16');
  });

  it('renders without any console errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithRouter(<Home />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
}); 