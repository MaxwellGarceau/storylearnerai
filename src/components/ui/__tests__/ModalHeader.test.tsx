import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ModalHeader } from '../ModalHeader';
import { Info } from 'lucide-react';

describe('ModalHeader', () => {
  it('renders title and optional icon', () => {
    render(<ModalHeader title='Settings' onClose={() => {}} icon={Info} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ModalHeader title='Dialog' onClose={onClose} />);
    const btn = document.querySelector('button');
    fireEvent.click(btn as HTMLButtonElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
