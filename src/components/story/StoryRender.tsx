import React, { useState, useRef, useEffect } from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface StoryRenderProps {
  translationData: TranslationResponse;
}

const StoryRender: React.FC<StoryRenderProps> = ({ translationData }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showTranslationInfo, setShowTranslationInfo] = useState(false);
  const [arrowPosition, setArrowPosition] = useState(24); // Default position
  const [modalTop, setModalTop] = useState(80); // Default top position
  const [modalRight, setModalRight] = useState(16); // Default right position
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!translationData) {
    return null;
  }



  const calculateModalPosition = () => {
    if (buttonRef.current) {
      const container = buttonRef.current.closest('.relative');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        // Modal dimensions
        const modalWidth = 288; // w-72
        const modalPadding = 16; // p-4
        const screenPadding = 16; // Minimum distance from screen edges
        
        // Calculate button bottom relative to container top
        const buttonBottomFromTop = (buttonRect.bottom - containerRect.top) + 16; // 16px gap (8px base + 8px extra)
        
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
        
        // Ensure modal right position is never negative (within container)
        finalModalRight = Math.max(0, finalModalRight);
        
        // Check bottom edge: if modal would go off bottom, position it above the button
        let finalModalTop = buttonBottomFromTop;
        const modalBottom = containerRect.top + buttonBottomFromTop + 200; // Approximate modal height
        
        if (modalBottom + screenPadding > viewportHeight) {
          // Position above button instead
          const buttonTopFromTop = (buttonRect.top - containerRect.top) - 16; // 16px gap above (8px base + 8px extra)
          finalModalTop = Math.max(screenPadding, buttonTopFromTop - 200); // Approximate modal height
        }
        
        // Calculate arrow position using the final modal position
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const finalModalRightEdgeX = containerRect.right - finalModalRight;
        const arrowOffsetFromModalRight = finalModalRightEdgeX - buttonCenterX;
        
        // Arrow constraints
        const arrowWidth = 16;
        const minOffset = arrowWidth / 2; // 8px from modal's right edge
        const maxOffset = modalWidth - arrowWidth - 8; // 8px from modal's left edge
        
        // Clamp arrow position to stay within modal bounds
        const clampedArrowOffset = Math.max(minOffset, Math.min(arrowOffsetFromModalRight, maxOffset));
        
        // Update all state at once
        setModalTop(finalModalTop);
        setModalRight(finalModalRight);
        setArrowPosition(clampedArrowOffset);
      }
    }
  };

  const toggleStoryView = () => {
    setShowOriginal(!showOriginal);
  };

  const toggleTranslationInfo = () => {
    setShowTranslationInfo(!showTranslationInfo);
    
    // Calculate modal and arrow position when modal opens
    if (!showTranslationInfo) {
      // Use setTimeout to ensure DOM is updated before calculation
      setTimeout(() => {
        calculateModalPosition();
      }, 0);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        buttonRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTranslationInfo(false);
      }
    };

    if (showTranslationInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTranslationInfo]);

  // Handle window resize to update modal and arrow position
  useEffect(() => {
    const handleResize = () => {
      if (showTranslationInfo) {
        calculateModalPosition();
      }
    };

    if (showTranslationInfo) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showTranslationInfo]);

  return (
    <div className="mt-4 space-y-4">
      {/* Single Story Container - Toggleable */}
      <div className={`p-4 border rounded-md transition-all duration-300 relative ${
        showOriginal 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-2 mb-4">
          <h3 className={`text-lg font-semibold transition-colors duration-300 lg:flex-shrink-0 ${
            showOriginal ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {showOriginal 
              ? 'Original Story (Spanish):' 
              : 'Translated Story (English):'
            }
          </h3>
          <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-2 sm:gap-3 lg:gap-2 flex-wrap">
            {!showOriginal && (
              <>
                <button
                  ref={buttonRef}
                  onClick={toggleTranslationInfo}
                  className="px-2 py-1.5 sm:px-2 sm:py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200 whitespace-nowrap order-2 sm:order-1"
                >
                  Show translation info
                </button>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap order-1 sm:order-2">
                  {translationData.difficulty} Level
                </span>
              </>
            )}
            <button
              onClick={toggleStoryView}
              className={`px-3 py-1.5 sm:px-3 sm:py-1 text-sm font-medium rounded transition-all duration-200 whitespace-nowrap order-3 ${
                showOriginal
                  ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
            >
              {showOriginal ? 'Show translated story' : 'Show original story'}
            </button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <p className="text-gray-700 whitespace-pre-wrap transition-opacity duration-300">
            {showOriginal ? translationData.originalText : translationData.translatedText}
          </p>
        </div>

        {/* Translation Info Modal */}
        {showTranslationInfo && (
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
        )}
      </div>
    </div>
  );
};

export default StoryRender;
