import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import FullPageStoryInput from '../FullPageStoryInput';
import { TooltipProvider } from '@radix-ui/react-tooltip';

// Helper function to wrap components with TooltipProvider
const renderWithTooltipProvider = (component: React.ReactElement) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

// Mock PDFUploadModal component
vi.mock('../PDFUploadModal', () => ({
  default: ({
    isOpen,
    onClose,
    onTextExtracted,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onTextExtracted: (text: string) => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid='pdf-upload-modal'>
        <div>Upload PDF</div>
        <button onClick={() => onTextExtracted('Extracted text from PDF')}>
          Extract Text
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string): string => {
      const translations: Record<string, string> = {
        'story.uploadTitle': 'Upload Story',
        'story.uploadDescription':
          'Upload a story file or paste text to get started',
        'story.translateButton': 'Translate Story',
        'storyInput.placeholder':
          'Ingresa tu historia en español aquí... (Enter your Spanish story here...)',
        'storyInput.tip':
          "💡 Tip: You can paste long stories, articles, or any Spanish text you'd like to translate",
        'common.edit': 'Edit',
        'storyInput.validation.securityWarning': '⚠️ Security Warning',
        'storyInput.validation.maliciousContentRemoved':
          'Malicious content has been automatically removed for your safety.',
        'storyInput.validation.invalidInput': 'Invalid input detected',
        'storyInput.validation.fixInput':
          'Please fix the input before translating',
        'storyInput.optionsModal.title': 'Story Options',
        'storyInput.optionsModal.languageLabel': 'Target Language',
        'storyInput.optionsModal.difficultyLabel': 'Target Difficulty (CEFR)',
        'storyInput.optionsModal.a1': 'A1 (Beginner)',
        'storyInput.optionsModal.a2': 'A2 (Elementary)',
        'storyInput.optionsModal.b1': 'B1 (Intermediate)',
        'storyInput.optionsModal.b2': 'B2 (Upper Intermediate)',
        'storyInput.currentlySupported':
          'Currently only {language} translation is supported.',
        'storyInput.difficultyDescription':
          'The story will be adapted to this {language} proficiency level.',
        'storyInput.done': 'Done',
        'storyInput.confirmationModal.title': 'Confirm Translation Options',
        'storyInput.confirmationModal.from': 'From:',
        'storyInput.confirmationModal.to': 'To:',
        'storyInput.confirmationModal.difficulty': 'Difficulty:',
        'storyInput.confirmationModal.cancel': 'Cancel',
        'storyInput.confirmationModal.confirm': 'Confirm & Translate',
        'storySidebar.difficultyLevels.a1': 'A1 (Beginner)',
        'storySidebar.difficultyLevels.a2': 'A2 (Elementary)',
        'storySidebar.difficultyLevels.b1': 'B1 (Intermediate)',
        'storySidebar.difficultyLevels.b2': 'B2 (Upper Intermediate)',
        'story.uploadPDF': 'Upload PDF',
      };
      return translations[key] || key;
    },
  }),
}));

describe('FullPageStoryInput Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isTranslating: false,
    formData: {
      language: 'en' as const,
      difficulty: 'a1' as const,
      selectedVocabulary: [] as string[],
    },
    onFormDataChange: vi.fn(),
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with correct title and description', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    expect(screen.getByText('Upload Story')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a story file or paste text to get started')
    ).toBeInTheDocument();
  });

  it('renders textarea with correct placeholder', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      'Ingresa tu historia en español aquí... (Enter your Spanish story here...)'
    );
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange when user types in textarea', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test story' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('Test story');
  });

  it('displays the provided value in textarea', () => {
    const testValue = 'Esta es una historia de prueba.';
    renderWithTooltipProvider(
      <FullPageStoryInput {...defaultProps} value={testValue} />
    );

    const textarea = screen.getByDisplayValue(testValue);
    expect(textarea).toBeInTheDocument();
  });

  it('renders with custom placeholder when provided', () => {
    const customPlaceholder = 'Custom placeholder text';
    renderWithTooltipProvider(
      <FullPageStoryInput {...defaultProps} placeholder={customPlaceholder} />
    );

    const textarea = screen.getByPlaceholderText(customPlaceholder);
    expect(textarea).toBeInTheDocument();
  });

  it('renders translate button', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const translateButton = screen.getByText('Translate Story');
    expect(translateButton).toBeInTheDocument();
  });

  it('renders PDF upload button', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const pdfUploadButton = screen.getByTestId('pdf-upload-button');
    expect(pdfUploadButton).toBeInTheDocument();
    expect(screen.getByText('Upload PDF')).toBeInTheDocument();
  });

  it('opens PDF upload modal when upload button is clicked', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const pdfUploadButton = screen.getByTestId('pdf-upload-button');
    fireEvent.click(pdfUploadButton);

    // Modal should be rendered
    expect(screen.getByTestId('pdf-upload-modal')).toBeInTheDocument();
  });

  it('calls onSubmit when translate button is clicked', () => {
    renderWithTooltipProvider(
      <FullPageStoryInput {...defaultProps} value='Test story' />
    );

    const translateButton = screen.getByRole('button', {
      name: /translate story/i,
    });
    fireEvent.click(translateButton);

    // Wait for confirmation modal to appear and click confirm
    const confirmButton = screen.getByRole('button', {
      name: /confirm & translate/i,
    });
    fireEvent.click(confirmButton);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('disables translate button when textarea is empty', () => {
    renderWithTooltipProvider(
      <FullPageStoryInput {...defaultProps} value='' />
    );

    const translateButton = screen.getByRole('button', {
      name: /translate story/i,
    });
    expect(translateButton).toBeDisabled();
  });

  it('disables translate button when isTranslating is true', () => {
    renderWithTooltipProvider(
      <FullPageStoryInput
        {...defaultProps}
        isTranslating={true}
        value='Test story'
      />
    );

    const translateButton = screen.getByRole('button', {
      name: /translating/i,
    });
    expect(translateButton).toBeDisabled();
  });

  it('shows loading state when isTranslating is true', () => {
    renderWithTooltipProvider(
      <FullPageStoryInput
        {...defaultProps}
        isTranslating={true}
        value='Test story'
      />
    );

    expect(screen.getByText('Translating...')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders tip text at the bottom', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    expect(
      screen.getByText(/💡 Tip: You can paste long stories/)
    ).toBeInTheDocument();
  });

  it('has correct textarea styling classes', () => {
    renderWithTooltipProvider(<FullPageStoryInput {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('w-full', 'h-full', 'resize-none', 'border-0');
  });
});
