import React, { useState, useRef, useEffect } from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface TranslationInfoModalProps {
  translationData: TranslationResponse;
  isOpen: boolean;
  onClose: () => void;
  triggerButtonRef: React.RefObject<HTMLButtonElement>;
}

const TranslationInfoModal: React.FC<TranslationInfoModalProps> = ({
  translationData,
  isOpen,
  onClose,
  triggerButtonRef
}) => {
  const [arrowPosition, setArrowPosition] = useState(24);
  const [modalTop, setModalTop] = useState(80);
  const [modalRight, setModalRight] = useState(16);
  const modalRef = useRef<HTMLDivElement>(null);

  const calculateModalPosition = () => {
    if (triggerButtonRef.current) {
      const container = triggerButtonRef.current.closest('.relative');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = triggerButtonRef.current.getBoundingClientRect();
        
        // Modal dimensions
        const modalWidth = 288;
        const screenPadding = 16;
        
        // Calculate button bottom relative to container top
        const buttonBottomFromTop = (buttonRect.bottom - containerRect.top) + 16;
        
        // Calculate ideal modal right position (aligned with button right edge)
        const idealButtonRightFromContainerRight = containerRect.right - buttonRect.right;
        
        // Viewport boundary checks
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check right edge: modal shouldn't extend beyond viewport right edge
        const modalRightEdge = containerRect.right - idealButtonRightFromContainerRight;
        const modalLeftEdge = modalRightEdge - modalWidth;
        
        let finalModalRight = idealButtonRightFromContainerRight;
        
        // If modal would go off right edge, push it left
        if (modalRightEdge + screenPadding > viewportWidth) {
          finalModalRight = containerRect.right - (viewportWidth - modalWidth - screenPadding);
        }
        
        // If modal would go off left edge, push it right
        if (modalLeftEdge < screenPadding) {
          finalModalRight = containerRect.right - (modalWidth + screenPadding);
        }
        
        // Ensure modal right position is never negative
        finalModalRight = Math.max(0, finalModalRight);
        
        // Check bottom edge: if modal would go off bottom, position it above the button
        let finalModalTop = buttonBottomFromTop;
        const modalBottom = containerRect.top + buttonBottomFromTop + 200;
        
        if (modalBottom + screenPadding > viewportHeight) {
          const buttonTopFromTop = (buttonRect.top - containerRect.top) - 16;
          finalModalTop = Math.max(screenPadding, buttonTopFromTop - 200);
        }
        
        // Calculate arrow position using the final modal position
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const finalModalRightEdgeX = containerRect.right - finalModalRight;
        const arrowOffsetFromModalRight = finalModalRightEdgeX - buttonCenterX;
        
        // Arrow constraints
        const arrowWidth = 16;
        const minOffset = arrowWidth / 2;
        const maxOffset = modalWidth - arrowWidth - 8;
        
        // Clamp arrow position to stay within modal bounds
        const clampedArrowOffset = Math.max(minOffset, Math.min(arrowOffsetFromModalRight, maxOffset));
        
        // Update all state at once
        setModalTop(finalModalTop);
        setModalRight(finalModalRight);
        setArrowPosition(clampedArrowOffset);
      }
    }
  };

  // Calculate position when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        calculateModalPosition();
      }, 0);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        triggerButtonRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !triggerButtonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle window resize to update modal position
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculateModalPosition();
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className="absolute w-72 max-w-[calc(100%-32px)] bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 animate-in slide-in-from-top-2 fade-in duration-200"
      style={{ 
        top: `${modalTop}px`,
        right: `${modalRight}px`
      }}
    >
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Translation Details</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            <span><strong>From:</strong> {translationData.fromLanguage}</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            <span><strong>To:</strong> {translationData.toLanguage}</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            <span><strong>Difficulty Level:</strong> {translationData.difficulty} (CEFR)</span>
          </li>
        </ul>
      </div>
      
      {/* Dynamically positioned arrow pointing up to button */}
      <div 
        className="absolute -top-2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
        style={{ right: `${arrowPosition}px` }}
      ></div>
    </div>
  );
};

export default TranslationInfoModal; 