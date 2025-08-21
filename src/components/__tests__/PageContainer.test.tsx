import React from 'react';
import { render } from '@testing-library/react';
import PageContainer from '../PageContainer';

describe('PageContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <PageContainer>
        <div>Test content</div>
      </PageContainer>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('applies default max-w-6xl class', () => {
    const { container } = render(
      <PageContainer>
        <div>Test content</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass('max-w-6xl');
    expect(pageContainer).not.toHaveClass('max-w-2xl');
  });

  it('applies custom maxWidth class', () => {
    const { container } = render(
      <PageContainer maxWidth='4xl'>
        <div>Test content</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass('max-w-4xl');
  });

  it('applies default container classes', () => {
    const { container } = render(
      <PageContainer>
        <div>Test content</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PageContainer className='custom-class'>
        <div>Test content</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass('custom-class');
  });

  it('combines custom className with default classes', () => {
    const { container } = render(
      <PageContainer className='custom-class' maxWidth='2xl'>
        <div>Test content</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild as HTMLElement;
    expect(pageContainer).toHaveClass(
      'container',
      'mx-auto',
      'px-4',
      'py-8',
      'max-w-2xl',
      'custom-class'
    );
  });
});
