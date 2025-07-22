import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../Home';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the main heading', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    expect(headings.length).toBeGreaterThan(0);
    // Check that we have both the header link and the main h1
    expect(headings).toHaveLength(2);
  });

  it('renders the description text', () => {
    renderWithRouter(<Home />);
    
    const descriptions = screen.getAllByText(/Translate stories from any language to English and enhance your learning experience/);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('renders the "Start Translating" button', () => {
    renderWithRouter(<Home />);
    
    const startButtons = screen.getAllByRole('link', { name: /start translating/i });
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('renders the "How it works" section', () => {
    renderWithRouter(<Home />);
    
    const howItWorksSections = screen.getAllByText('How it works:');
    expect(howItWorksSections.length).toBeGreaterThan(0);
  });

  it('renders all three steps in the "How it works" section', () => {
    renderWithRouter(<Home />);
    
    // Check for step numbers
    const step1s = screen.getAllByText('1');
    const step2s = screen.getAllByText('2');
    const step3s = screen.getAllByText('3');
    expect(step1s.length).toBeGreaterThan(0);
    expect(step2s.length).toBeGreaterThan(0);
    expect(step3s.length).toBeGreaterThan(0);
    
    // Check for step descriptions
    const step1Descriptions = screen.getAllByText(/Enter a story in any language you want to learn from/);
    const step2Descriptions = screen.getAllByText(/Our AI translates it to English with detailed explanations/);
    const step3Descriptions = screen.getAllByText(/Read and learn with side-by-side translations and vocabulary help/);
    expect(step1Descriptions.length).toBeGreaterThan(0);
    expect(step2Descriptions.length).toBeGreaterThan(0);
    expect(step3Descriptions.length).toBeGreaterThan(0);
  });

  it('has correct styling classes on the main heading', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    const mainHeading = headings.find(h => h.tagName === 'H1');
    expect(mainHeading).toHaveClass('text-4xl', 'font-bold', 'mb-6');
  });

  it('has correct styling classes on the description', () => {
    renderWithRouter(<Home />);
    
    const descriptions = screen.getAllByText(/Translate stories from any language to English and enhance your learning experience/);
    const description = descriptions[0];
    expect(description).toHaveClass('text-xl', 'text-gray-600', 'mb-8');
  });

  it('has correct styling classes on the start button', () => {
    renderWithRouter(<Home />);
    
    const startLinks = screen.getAllByRole('link', { name: /start translating/i });
    const startLink = startLinks[0];
    const startButton = startLink.querySelector('button');
    expect(startButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'px-8', 'py-3', 'rounded-md', 'transition-colors', 'text-lg');
  });

  it('has correct styling classes on the "How it works" heading', () => {
    renderWithRouter(<Home />);
    
    const howItWorksHeadings = screen.getAllByText('How it works:');
    const howItWorksHeading = howItWorksHeadings[0];
    expect(howItWorksHeading).toHaveClass('text-lg', 'font-semibold', 'mb-4');
  });

  it('has correct styling classes on step numbers', () => {
    renderWithRouter(<Home />);
    
    const stepNumbers = screen.getAllByText(/^[123]$/);
    stepNumbers.forEach(number => {
      expect(number).toHaveClass('bg-blue-100', 'text-blue-600', 'rounded-full', 'w-6', 'h-6', 'flex', 'items-center', 'justify-center', 'text-sm', 'font-semibold', 'flex-shrink-0', 'mt-0.5');
    });
  });

  it('has correct styling classes on step descriptions', () => {
    renderWithRouter(<Home />);
    
    const stepDescriptions = screen.getAllByText(/Enter a story|Our AI translates|Read and learn/);
    stepDescriptions.forEach(description => {
      // The text-gray-600 class is on the grandparent div (the container with space-y-3)
      const grandparentDiv = description.closest('div')?.parentElement;
      expect(grandparentDiv).toHaveClass('text-gray-600');
    });
  });

  it('has proper container styling', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    const mainHeading = headings.find(h => h.tagName === 'H1');
    const container = mainHeading?.closest('div');
    expect(container).toHaveClass('text-center', 'max-w-2xl', 'mx-auto');
  });

  it('has proper spacing between sections', () => {
    renderWithRouter(<Home />);
    
    const descriptions = screen.getAllByText(/Translate stories from any language to English and enhance your learning experience/);
    const description = descriptions[0];
    expect(description).toHaveClass('mb-8');
    
    const howItWorksHeadings = screen.getAllByText('How it works:');
    const howItWorksHeading = howItWorksHeadings[0];
    expect(howItWorksHeading).toHaveClass('mb-4');
  });

  it('renders step containers with proper layout', () => {
    renderWithRouter(<Home />);
    
    const stepContainers = screen.getAllByText(/Enter a story|Our AI translates|Read and learn/).map(el => el.closest('div'));
    
    stepContainers.forEach(container => {
      expect(container).toHaveClass('flex', 'items-start', 'space-x-3');
    });
  });

  it('has proper spacing between steps', () => {
    renderWithRouter(<Home />);
    
    const howItWorksHeadings = screen.getAllByText('How it works:');
    const howItWorksHeading = howItWorksHeadings.find(h => h.tagName === 'H3');
    const stepsContainer = howItWorksHeading?.nextElementSibling;
    expect(stepsContainer).toHaveClass('text-left', 'space-y-3');
  });

  it('renders the start button with proper accessibility attributes', () => {
    renderWithRouter(<Home />);
    
    const startLinks = screen.getAllByRole('link', { name: /start translating/i });
    const startLink = startLinks[0];
    expect(startLink).toHaveAttribute('href', '/translate');
  });

  it('has proper semantic HTML structure', () => {
    renderWithRouter(<Home />);
    
    // Check for proper heading hierarchy
    const mainHeadings = screen.getAllByRole('heading', { level: 1 });
    const mainHeading = mainHeadings[0];
    expect(mainHeading).toHaveTextContent('Story Learner AI');
    
    const subHeadings = screen.getAllByRole('heading', { level: 3 });
    const subHeading = subHeadings[0];
    expect(subHeading).toHaveTextContent('How it works:');
  });

  it('renders all content in the correct order', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    const mainHeading = headings.find(h => h.tagName === 'H1');
    const container = mainHeading?.closest('div');
    const children = Array.from(container?.children || []);
    
    // Check order: heading, description, space-y-4 div
    expect(children[0]).toHaveTextContent('Story Learner AI');
    expect(children[1]).toHaveTextContent(/Translate stories from any language/);
    expect(children[2]).toHaveClass('space-y-4');
    
    // Check that the space-y-4 div contains the button and how it works section
    const spaceY4Div = children[2];
    const spaceY4Children = Array.from(spaceY4Div?.children || []);
    expect(spaceY4Children[0]).toHaveTextContent('Start Translating');
    expect(spaceY4Children[1]).toHaveTextContent('How it works:');
  });

  it('has responsive design classes', () => {
    renderWithRouter(<Home />);
    
    const headings = screen.getAllByText('Story Learner AI');
    const mainHeading = headings.find(h => h.tagName === 'H1');
    const container = mainHeading?.closest('div');
    expect(container).toHaveClass('max-w-2xl');
  });

  it('renders without any console errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithRouter(<Home />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
}); 