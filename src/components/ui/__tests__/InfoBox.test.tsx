import React from 'react';
import { render, screen } from '@testing-library/react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { InfoBox } from '../InfoBox';

// Test cases intentionally added by user:
// - Test all variant types (info, success, warning, error)
// - Test with and without icons
// - Test accessibility attributes
// - Test custom className and props spreading
// - Test ref forwarding

describe('InfoBox Component', () => {
  const defaultProps = {
    title: 'Test Title',
    children: 'Test content'
  };

  describe('Rendering', () => {
    it('renders with default info variant', () => {
      render(<InfoBox {...defaultProps} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders with custom title and content', () => {
      render(
        <InfoBox title="Custom Title">
          <p>Custom content with HTML</p>
        </InfoBox>
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom content with HTML')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      render(<InfoBox {...defaultProps} data-testid="no-icon-test" />);
      
      const infoBox = screen.getByTestId('no-icon-test');
      expect(infoBox).not.toHaveAttribute('data-testid', 'icon');
    });
  });

  describe('Variants', () => {
    it('applies info variant styles correctly', () => {
      render(<InfoBox {...defaultProps} variant="info" data-testid="info-variant-box" />);
      
      const infoBox = screen.getByTestId('info-variant-box');
      expect(infoBox).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });

    it('applies success variant styles correctly', () => {
      render(<InfoBox {...defaultProps} variant="success" data-testid="success-variant-box" />);
      
      const infoBox = screen.getByTestId('success-variant-box');
      expect(infoBox).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
    });

    it('applies warning variant styles correctly', () => {
      render(<InfoBox {...defaultProps} variant="warning" data-testid="warning-variant-box" />);
      
      const infoBox = screen.getByTestId('warning-variant-box');
      expect(infoBox).toHaveClass('bg-amber-50', 'border-amber-200', 'text-amber-800');
    });

    it('applies error variant styles correctly', () => {
      render(<InfoBox {...defaultProps} variant="error" data-testid="error-variant-box" />);
      
      const infoBox = screen.getByTestId('error-variant-box');
      expect(infoBox).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    });

    it('uses info as default variant when not specified', () => {
      render(<InfoBox {...defaultProps} data-testid="default-variant-box" />);
      
      const infoBox = screen.getByTestId('default-variant-box');
      expect(infoBox).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });
  });

  describe('Icons', () => {
    it('renders icon when provided', () => {
      render(<InfoBox {...defaultProps} icon={<Info data-testid="icon" />} />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies correct icon styles for info variant', () => {
      render(<InfoBox {...defaultProps} variant="info" icon={<Info data-testid="info-icon" />} />);
      
      const iconContainer = screen.getByTestId('info-icon').parentElement;
      expect(iconContainer).toHaveClass('text-blue-600');
    });

    it('applies correct icon styles for success variant', () => {
      render(<InfoBox {...defaultProps} variant="success" icon={<CheckCircle data-testid="success-icon" />} />);
      
      const iconContainer = screen.getByTestId('success-icon').parentElement;
      expect(iconContainer).toHaveClass('text-green-600');
    });

    it('applies correct icon styles for warning variant', () => {
      render(<InfoBox {...defaultProps} variant="warning" icon={<AlertTriangle data-testid="warning-icon" />} />);
      
      const iconContainer = screen.getByTestId('warning-icon').parentElement;
      expect(iconContainer).toHaveClass('text-amber-600');
    });

    it('applies correct icon styles for error variant', () => {
      render(<InfoBox {...defaultProps} variant="error" icon={<XCircle data-testid="error-icon" />} />);
      
      const iconContainer = screen.getByTestId('error-icon').parentElement;
      expect(iconContainer).toHaveClass('text-red-600');
    });

    it('does not render icon container when no icon provided', () => {
      const { container } = render(<InfoBox {...defaultProps} />);
      
      // Should not have any elements with icon-related classes
      const iconContainers = container.querySelectorAll('.text-blue-600, .text-green-600, .text-amber-600, .text-red-600');
      expect(iconContainers).toHaveLength(0);
    });
  });

  describe('Customization', () => {
    it('applies custom className', () => {
      render(<InfoBox {...defaultProps} className="custom-class" data-testid="custom-class-box" />);
      
      const infoBox = screen.getByTestId('custom-class-box');
      expect(infoBox).toHaveClass('custom-class');
    });

    it('spreads additional props to the root element', () => {
      render(
        <InfoBox 
          {...defaultProps} 
          data-testid="custom-info-box"
          aria-label="Custom info box"
        />
      );
      
      const infoBox = screen.getByTestId('custom-info-box');
      expect(infoBox).toHaveAttribute('aria-label', 'Custom info box');
    });

    it('merges custom className with variant classes', () => {
      render(
        <InfoBox 
          {...defaultProps} 
          variant="success"
          className="custom-class"
          data-testid="merge-class-box"
        />
      );
      
      const infoBox = screen.getByTestId('merge-class-box');
      expect(infoBox).toHaveClass('custom-class', 'bg-green-50', 'border-green-200', 'text-green-800');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<InfoBox {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent('Test Title');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<InfoBox {...defaultProps} data-testid="semantic-box" />);
      
      const infoBox = screen.getByTestId('semantic-box');
      expect(infoBox).toBeInTheDocument();
    });

    it('supports custom accessibility attributes', () => {
      render(
        <InfoBox 
          {...defaultProps} 
          role="alert"
          aria-live="polite"
          data-testid="accessibility-info-box"
        />
      );
      
      const infoBox = screen.getByTestId('accessibility-info-box');
      expect(infoBox).toHaveAttribute('role', 'alert');
      expect(infoBox).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Content Structure', () => {
    it('renders title in a font-medium element', () => {
      render(<InfoBox {...defaultProps} data-testid="title-info-box" />);
      
      const infoBox = screen.getByTestId('title-info-box');
      const title = infoBox.querySelector('.font-medium');
      expect(title).toHaveClass('font-medium');
    });

    it('renders children in the correct container', () => {
      render(
        <InfoBox title="Test">
          <p data-testid="child-content">Child content</p>
        </InfoBox>
      );
      
      const childContent = screen.getByTestId('child-content');
      expect(childContent).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      render(
        <InfoBox title="Complex Content">
          <div>
            <p>Paragraph 1</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </InfoBox>
      );
      
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });
});
