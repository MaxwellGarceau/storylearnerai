import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WordHighlight from '../WordHighlight';

describe('WordHighlight', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render word text by default', () => {
    render(<WordHighlight word="hello" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    render(<WordHighlight word="hello">Custom Text</WordHighlight>);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<WordHighlight word="hello" className="custom-class" />);
    const element = screen.getByText('hello');
    expect(element).toHaveClass('custom-class');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<WordHighlight word="hello" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('hello'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onMouseEnter when hovered', () => {
    const handleMouseEnter = vi.fn();
    render(<WordHighlight word="hello" onMouseEnter={handleMouseEnter} />);
    
    fireEvent.mouseEnter(screen.getByText('hello'));
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('should call onMouseLeave when unhovered', () => {
    const handleMouseLeave = vi.fn();
    render(<WordHighlight word="hello" onMouseLeave={handleMouseLeave} />);
    
    fireEvent.mouseLeave(screen.getByText('hello'));
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<WordHighlight word="hello" onClick={handleClick} disabled={true} />);
    
    const element = screen.getByText('hello');
    expect(element).toHaveClass('cursor-default', 'opacity-60');
    expect(element).not.toHaveClass('cursor-pointer');
    
    fireEvent.click(element);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have hover styles when not disabled', () => {
    render(<WordHighlight word="hello" />);
    
    const element = screen.getByText('hello');
    expect(element).toHaveClass('cursor-pointer');
    expect(element).not.toHaveClass('cursor-default', 'opacity-60');
  });
});
