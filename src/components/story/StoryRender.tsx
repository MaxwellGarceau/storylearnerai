import React, { useState, useRef, useEffect } from 'react';
import { TranslationResponse } from '../../lib/translationService';

interface StoryRenderProps {
  translationData: TranslationResponse;
}

const StoryRender: React.FC<StoryRenderProps> = ({ translationData }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showTranslationInfo, setShowTranslationInfo] = useState(false);
  const [arrowPosition, setArrowPosition] = useState(24); // Default position
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!translationData) {
    return null;
  }

  const calculateArrowPosition = () => {
    if (buttonRef.current) {
      // Get button position relative to the container
      const container = buttonRef.current.closest('.relative');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        // Calculate button center relative to container's right edge
        const buttonCenterFromRight = containerRect.right - (buttonRect.left + buttonRect.width / 2);
        
        // Account for modal's right offset (16px) and arrow width (8px for center)
        const arrowOffset = buttonCenterFromRight - 16 - 8;
        
        // Modal width is 288px (w-72), arrow is 16px wide
        // Arrow should be at least 8px from edges to be fully within modal
        const modalWidth = 288;
        const arrowWidth = 16;
        const minOffset = arrowWidth / 2; // 8px from right edge
        // For left edge: arrow's left boundary should be 8px from modal's left edge
        // Right position = modalWidth - 8px (left margin) - 16px (arrow width) = 264px
        const maxOffset = modalWidth - 8 - arrowWidth; // 264px from right edge
        
        // Clamp arrow position to stay within modal bounds
        const clampedOffset = Math.max(minOffset, Math.min(arrowOffset, maxOffset));
        setArrowPosition(clampedOffset);
      }
    }
  };

  const toggleStoryView = () => {
    setShowOriginal(!showOriginal);
  };

  const toggleTranslationInfo = () => {
    setShowTranslationInfo(!showTranslationInfo);
    
    // Calculate arrow position when modal opens
    if (!showTranslationInfo) {
      // Use setTimeout to ensure DOM is updated before calculation
      setTimeout(() => {
        calculateArrowPosition();
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

  // Handle window resize to update arrow position
  useEffect(() => {
    const handleResize = () => {
      if (showTranslationInfo) {
        calculateArrowPosition();
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
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            showOriginal ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {showOriginal 
              ? 'Original Story (Spanish):' 
              : 'Translated Story (English):'
            }
          </h3>
          <div className="flex items-center space-x-2">
            {!showOriginal && (
              <>
                <button
                  ref={buttonRef}
                  onClick={toggleTranslationInfo}
                  className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
                >
                  Show translation info
                </button>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                  {translationData.difficulty} Level
                </span>
              </>
            )}
            <button
              onClick={toggleStoryView}
              className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${
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
            className="absolute top-16 right-4 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 animate-in slide-in-from-top-2 fade-in duration-200"
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
