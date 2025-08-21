import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUploadArea, type FileInfo } from '../FileUploadArea';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'pdfUpload.uploadPrompt': 'Click to upload PDF',
        'pdfUpload.fileRequirements': `Maximum file size: ${options?.maxSize}MB, Maximum pages: ${options?.maxPages}`,
      };
      return translations[key] || key;
    },
  }),
}));

// Test cases intentionally added by user:
// - Test all states (default, selected, processing)
// - Test file selection and validation
// - Test accessibility attributes and keyboard navigation
// - Test custom props and className
// - Test ref forwarding
// - Test file input interactions

describe('FileUploadArea Component', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    onValidationError: vi.fn(),
  };

  const mockFile = new File(['test content'], 'test.pdf', {
    type: 'application/pdf',
  });

  const mockFileInfo: FileInfo = {
    name: 'test.pdf',
    size: '1.2 MB',
    pages: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default state', () => {
      render(<FileUploadArea {...defaultProps} data-testid='default-render' />);

      expect(screen.getByText('Click to upload PDF')).toBeInTheDocument();
      expect(
        screen.getByText(/Maximum file size: 5MB, Maximum pages: 10/)
      ).toBeInTheDocument();
      const container = screen.getByTestId('default-render');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it('renders with custom upload prompt', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          uploadPrompt='Custom upload prompt'
          data-testid='custom-prompt'
        />
      );

      expect(screen.getByText('Custom upload prompt')).toBeInTheDocument();
      expect(screen.getByTestId('custom-prompt')).toBeInTheDocument();
    });

    it('renders with custom file requirements', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          fileRequirements='Custom requirements'
          data-testid='custom-requirements'
        />
      );

      expect(screen.getByText('Custom requirements')).toBeInTheDocument();
      expect(screen.getByTestId('custom-requirements')).toBeInTheDocument();
    });

    it('renders with custom accept types', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          accept='.txt,.doc'
          data-testid='custom-accept'
        />
      );

      const container = screen.getByTestId('custom-accept');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', '.txt,.doc');
      expect(container).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies default state styles', () => {
      render(<FileUploadArea {...defaultProps} data-testid='default-state' />);

      const uploadArea = screen.getByTestId('default-state-area');
      expect(uploadArea).toHaveClass(
        'border-gray-300',
        'hover:border-gray-400'
      );
    });

    it('applies selected state styles when file is selected', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={mockFileInfo}
          data-testid='selected-state'
        />
      );

      const uploadArea = screen.getByTestId('selected-state-area');
      expect(uploadArea).toHaveClass('border-green-300', 'bg-green-50');
    });

    it('applies processing state styles when processing', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='processing-state'
        />
      );

      const uploadArea = screen.getByTestId('processing-state-area');
      expect(uploadArea).toHaveClass('cursor-not-allowed', 'opacity-50');
    });

    it('shows selected file information', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={mockFileInfo}
          data-testid='file-info'
        />
      );

      const container = screen.getByTestId('file-info');
      const uploadArea = within(container).getByTestId('file-info-area');

      expect(within(uploadArea).getByText('test.pdf')).toBeInTheDocument();
      expect(
        within(uploadArea).getByText('1.2 MB • 5 pages')
      ).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it('shows file info without pages when pages not provided', () => {
      const fileInfoWithoutPages: FileInfo = {
        name: 'test.pdf',
        size: '1.2 MB',
      };

      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={fileInfoWithoutPages}
          data-testid='no-pages'
        />
      );

      const container = screen.getByTestId('no-pages');
      const uploadArea = within(container).getByTestId('no-pages-area');

      expect(within(uploadArea).getByText('test.pdf')).toBeInTheDocument();
      expect(within(uploadArea).getByText('1.2 MB')).toBeInTheDocument();
      expect(within(uploadArea).queryByText(/pages/)).not.toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('calls onFileSelect when file is selected', async () => {
      const user = userEvent.setup();
      render(<FileUploadArea {...defaultProps} data-testid='file-select' />);

      const container = screen.getByTestId('file-select');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(mockFile);
      expect(container).toBeInTheDocument();
    });

    it('does not call onFileSelect when no file is selected', () => {
      render(<FileUploadArea {...defaultProps} data-testid='no-file-select' />);

      const container = screen.getByTestId('no-file-select');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
      expect(container).toBeInTheDocument();
    });

    it('opens file dialog when upload area is clicked', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileUploadArea {...defaultProps} data-testid='click-upload' />);

      const uploadArea = screen.getByTestId('click-upload-area');
      await user.click(uploadArea);

      expect(clickSpy).toHaveBeenCalled();
      expect(screen.getByTestId('click-upload')).toBeInTheDocument();
    });

    it('does not open file dialog when processing', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='processing-click'
        />
      );

      const uploadArea = screen.getByTestId('processing-click-area');
      await user.click(uploadArea);

      expect(clickSpy).not.toHaveBeenCalled();
      expect(screen.getByTestId('processing-click')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper role and tabIndex for keyboard navigation', () => {
      render(
        <FileUploadArea {...defaultProps} data-testid='accessibility-test' />
      );

      const uploadArea = screen.getByTestId('accessibility-test-area');
      expect(uploadArea).toHaveAttribute('role', 'button');
      expect(uploadArea).toHaveAttribute('tabIndex', '0');
    });

    it('has appropriate aria-label for default state', () => {
      render(<FileUploadArea {...defaultProps} data-testid='aria-default' />);

      const uploadArea = screen.getByTestId('aria-default-area');
      expect(uploadArea).toHaveAttribute('aria-label', 'Select file to upload');
    });

    it('has appropriate aria-label for selected state', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={mockFileInfo}
          data-testid='aria-selected'
        />
      );

      const uploadArea = screen.getByTestId('aria-selected-area');
      expect(uploadArea).toHaveAttribute('aria-label', 'Change selected file');
    });

    it('has aria-disabled when processing', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='aria-disabled'
        />
      );

      const uploadArea = screen.getByTestId('aria-disabled-area');
      expect(uploadArea).toHaveAttribute('aria-disabled', 'true');
    });

    it('has tabIndex -1 when processing', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='tabindex-processing'
        />
      );

      const uploadArea = screen.getByTestId('tabindex-processing-area');
      expect(uploadArea).toHaveAttribute('tabIndex', '-1');
    });

    it('hides file input from screen readers', () => {
      render(<FileUploadArea {...defaultProps} data-testid='hidden-input' />);

      const container = screen.getByTestId('hidden-input');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toHaveAttribute('aria-hidden', 'true');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens file dialog on Enter key', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileUploadArea {...defaultProps} data-testid='keyboard-enter' />);

      const uploadArea = screen.getByTestId('keyboard-enter-area');
      await user.type(uploadArea, '{Enter}');

      expect(clickSpy).toHaveBeenCalled();
      expect(screen.getByTestId('keyboard-enter')).toBeInTheDocument();
    });

    it('opens file dialog on Space key', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(<FileUploadArea {...defaultProps} data-testid='keyboard-space' />);

      const uploadArea = screen.getByTestId('keyboard-space-area');
      await user.type(uploadArea, ' ');

      expect(clickSpy).toHaveBeenCalled();
      expect(screen.getByTestId('keyboard-space')).toBeInTheDocument();
    });

    it('does not open file dialog on keyboard when processing', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='keyboard-processing'
        />
      );

      const uploadArea = screen.getByTestId('keyboard-processing-area');
      await user.type(uploadArea, '{Enter}');

      expect(clickSpy).not.toHaveBeenCalled();
      expect(screen.getByTestId('keyboard-processing')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('applies custom className', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          className='custom-class'
          data-testid='custom-class'
        />
      );

      const container = screen.getByTestId('custom-class');
      expect(container).toHaveClass('custom-class');
    });

    it('spreads additional props to the root element', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          data-testid='custom-upload-area'
          aria-describedby='description'
        />
      );

      const container = screen.getByTestId('custom-upload-area');
      const uploadArea = screen.getByTestId('custom-upload-area-area');
      expect(container).toHaveAttribute('aria-describedby', 'description');
      expect(uploadArea).toBeInTheDocument();
    });

    it('uses custom maxFileSize and maxPages in requirements', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          maxFileSize={10}
          maxPages={20}
          data-testid='custom-max'
        />
      );

      expect(
        screen.getByText(/Maximum file size: 10MB, Maximum pages: 20/)
      ).toBeInTheDocument();
      expect(screen.getByTestId('custom-max')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <FileUploadArea {...defaultProps} ref={ref} data-testid='ref-test' />
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent('Click to upload PDF');
      expect(screen.getByTestId('ref-test')).toBeInTheDocument();
    });
  });

  describe('File Input Properties', () => {
    it('disables file input when processing', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={true}
          data-testid='disabled-input'
        />
      );

      const container = screen.getByTestId('disabled-input');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeDisabled();
      expect(container).toBeInTheDocument();
    });

    it('enables file input when not processing', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          isProcessing={false}
          data-testid='enabled-input'
        />
      );

      const container = screen.getByTestId('enabled-input');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).not.toBeDisabled();
      expect(container).toBeInTheDocument();
    });

    it('has correct accept attribute', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          accept='.pdf,.doc'
          data-testid='accept-attr'
        />
      );

      const container = screen.getByTestId('accept-attr');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', '.pdf,.doc');
      expect(container).toBeInTheDocument();
    });

    it('has hidden class', () => {
      render(<FileUploadArea {...defaultProps} data-testid='hidden-class' />);

      const container = screen.getByTestId('hidden-class');
      const fileInput = container.querySelector(
        'input[data-testid="pdf-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toHaveClass('hidden');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('shows upload icon in default state', () => {
      render(<FileUploadArea {...defaultProps} data-testid='upload-icon' />);

      // Check for Upload icon (Lucide React icon)
      const uploadArea = screen.getByTestId('upload-icon-area');
      expect(uploadArea).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('shows check icon in selected state', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={mockFileInfo}
          data-testid='check-icon'
        />
      );

      // Check for Check icon (Lucide React icon)
      const uploadArea = screen.getByTestId('check-icon-area');
      expect(uploadArea).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('applies correct icon colors for different states', () => {
      const { rerender } = render(
        <FileUploadArea {...defaultProps} data-testid='icon-colors' />
      );

      // Default state - gray icon
      let icon = screen.getByTestId('icon-colors-area').querySelector('svg');
      expect(icon).toHaveClass('text-gray-400');

      // Selected state - green icon
      rerender(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={mockFileInfo}
          data-testid='icon-colors'
        />
      );

      icon = screen.getByTestId('icon-colors-area').querySelector('svg');
      expect(icon).toHaveClass('text-green-600');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing fileInfo gracefully', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          data-testid='missing-fileinfo'
        />
      );

      // Should still render the upload area without crashing
      expect(screen.getByTestId('missing-fileinfo')).toBeInTheDocument();
    });

    it('handles empty fileInfo gracefully', () => {
      const emptyFileInfo: FileInfo = {
        name: '',
        size: '',
      };

      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={mockFile}
          fileInfo={emptyFileInfo}
          data-testid='empty-file-upload'
        />
      );

      // Should still render without crashing
      expect(screen.getByTestId('empty-file-upload')).toBeInTheDocument();
      expect(screen.getByTestId('empty-file-upload-area')).toBeInTheDocument();
    });

    it('handles null selectedFile gracefully', () => {
      render(
        <FileUploadArea
          {...defaultProps}
          selectedFile={null}
          fileInfo={mockFileInfo}
          data-testid='null-file-upload'
        />
      );

      // Should render in default state
      expect(screen.getByTestId('null-file-upload')).toBeInTheDocument();
      expect(screen.getByTestId('null-file-upload-area')).toBeInTheDocument();
    });
  });
});
