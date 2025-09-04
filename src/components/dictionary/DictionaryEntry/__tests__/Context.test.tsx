import React from 'react';
import { render } from '@testing-library/react';
import { useDictionaryEntryContext } from '../Context';

// Test added by assistant: verifies hook usage contract without unhandled errors

// Component that immediately uses the context hook
const NakedConsumer: React.FC = () => {
  useDictionaryEntryContext();
  return null;
};

interface ErrorBoundaryProps {
  onError: (error: Error) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return <span data-testid='caught-error' />;
    }
    return this.props.children as React.ReactElement;
  }
}

describe('DictionaryEntry Context', () => {
  it('throws when used outside of DictionaryEntry.Root', () => {
    let captured: unknown = null;
    render(
      <ErrorBoundary onError={(e) => (captured = e)}>
        <NakedConsumer />
      </ErrorBoundary>
    );
    expect(captured).toBeTruthy();
    if (captured instanceof Error) {
      expect(captured.message).toBe(
        'DictionaryEntry components must be used within DictionaryEntry.Root'
      );
    }
  });
});


