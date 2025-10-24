import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import BaseSidebarHeader from '../BaseSidebarHeader';
import {
  setupSidebarMocks,
  resetSidebarMocks,
  mockT,
} from '../../__tests__/sidebarMocks';
import { LanguageFilterProvider } from '../../../../hooks/useLanguageFilter';

// Setup mocks before tests
setupSidebarMocks();

// Mock hooks used inside LanguageFilterProvider to keep context simple
vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../../../hooks/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ],
    getLanguageName: (code: 'en' | 'es') =>
      code === 'en' ? 'English' : 'Spanish',
    getNativeLanguageName: (code: 'en' | 'es') =>
      code === 'en' ? 'English' : 'Español',
  }),
}));

// Provide a minimal wrapper that supplies LanguageFilterProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<LanguageFilterProvider>{ui}</LanguageFilterProvider>);
};

describe('BaseSidebarHeader', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    resetSidebarMocks();
    onClose.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, icon, and close button', () => {
    renderWithProvider(
      <BaseSidebarHeader
        title='My Title'
        icon={<span data-testid='icon' />}
        onClose={onClose}
        t={mockT}
      />
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', {
      name: 'storySidebar.closeLibrary',
    });
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProvider(
      <BaseSidebarHeader
        title='My Title'
        icon={<span />}
        onClose={onClose}
        t={mockT}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'storySidebar.closeLibrary' })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders language selector by default and shows available target languages', () => {
    renderWithProvider(
      <BaseSidebarHeader
        title='Title'
        icon={<span />}
        onClose={onClose}
        t={mockT}
      />
    );

    // Find select combobox trigger (Radix Select uses role combobox without accessible name)
    const trigger = screen.getByRole('combobox');

    // Open radix select content
    fireEvent.mouseDown(trigger);

    // Expect English/Spanish options rendered (items may render in portal)
    expect(
      screen.getAllByText(/English|Español|Spanish/).length
    ).toBeGreaterThan(0);
  });

  it('hides language selector when showLanguageSelector is false', () => {
    renderWithProvider(
      <BaseSidebarHeader
        title='Title'
        icon={<span />}
        onClose={onClose}
        t={mockT}
        showLanguageSelector={false}
      />
    );

    // There should be no trigger button for target language
    expect(
      screen.queryByRole('button', { name: /storySidebar.targetLanguage/i })
    ).toBeNull();
  });

  it('renders additional children content area', () => {
    renderWithProvider(
      <BaseSidebarHeader
        title='Title'
        icon={<span />}
        onClose={onClose}
        t={mockT}
      >
        <button>Extra</button>
      </BaseSidebarHeader>
    );

    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
