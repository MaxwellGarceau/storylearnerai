import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { useLocalization } from '../../../hooks/useLocalization';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../lib/i18n';
import { vi } from 'vitest';

// Mock the useLocalization hook
vi.mock('../../../hooks/useLocalization');

const mockUseLocalization = useLocalization as ReturnType<typeof vi.fn>;

describe('LanguageSelector', () => {
  const defaultMockReturn = {
    currentLocalization: 'en',
    isLocalizationLoaded: true,
    changeLocalization: vi.fn(),
    getCurrentLocalization: vi.fn().mockReturnValue({ code: 'en', name: 'English', nativeName: 'English' }),
    getSupportedLocalizations: vi.fn().mockReturnValue([
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
    ]),
    t: vi.fn((key: string) => key),
  };

  beforeEach(() => {
    mockUseLocalization.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  const renderWithI18n = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  describe('Button variant', () => {
    it('renders language button with current language', () => {
      renderWithI18n(<LanguageSelector variant="button" />);
      
      const button = screen.getByRole('button', { name: /english/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('English');
    });

    it('calls changeLocalization when clicked', async () => {
      const mockChangeLocalization = vi.fn();
      mockUseLocalization.mockReturnValue({
        ...defaultMockReturn,
        changeLocalization: mockChangeLocalization,
      });

      renderWithI18n(<LanguageSelector variant="button" />);
      
      const button = screen.getByRole('button', { name: /english/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockChangeLocalization).toHaveBeenCalledWith('es');
      });
    });

    it('displays globe icon', () => {
      renderWithI18n(<LanguageSelector variant="button" />);
      
      const button = screen.getByRole('button', { name: /english/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Select variant', () => {
    it('renders select dropdown with current language', () => {
      renderWithI18n(<LanguageSelector variant="select" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent('English');
    });

    it('opens dropdown when clicked', () => {
      renderWithI18n(<LanguageSelector variant="select" />);
      
      const select = screen.getByRole('combobox');
      fireEvent.click(select);

      // Should show both language options
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('calls changeLocalization when option is selected', async () => {
      const mockChangeLocalization = vi.fn();
      mockUseLocalization.mockReturnValue({
        ...defaultMockReturn,
        changeLocalization: mockChangeLocalization,
      });

      renderWithI18n(<LanguageSelector variant="select" />);
      
      const select = screen.getByRole('combobox');
      fireEvent.click(select);

      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption);

      await waitFor(() => {
        expect(mockChangeLocalization).toHaveBeenCalledWith('es');
      });
    });
  });

  describe('Default behavior', () => {
    it('defaults to select variant', () => {
      renderWithI18n(<LanguageSelector />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithI18n(<LanguageSelector className="custom-class" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for select variant', () => {
      renderWithI18n(<LanguageSelector variant="select" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-expanded');
    });

    it('has proper role for button variant', () => {
      renderWithI18n(<LanguageSelector variant="button" />);
      
      const button = screen.getByRole('button', { name: /english/i });
      expect(button).toBeInTheDocument();
    });
  });
});
