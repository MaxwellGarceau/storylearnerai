import { useEffect, useRef } from 'react';

/**
 * Custom hook to safeguard popover positioning
 * Prevents the popover from going above 10px from the viewport top
 */
export const usePopoverSafeguard = () => {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Function to check and fix popover positioning
    const checkPopoverPosition = () => {
      const popoverWrappers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
      
      popoverWrappers.forEach((wrapper) => {
        const computedStyle = window.getComputedStyle(wrapper);
        const transform = computedStyle.transform;
        
        // Parse the transform matrix to get the Y translation
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix.*\((.+)\)/);
          if (matrix) {
            const values = matrix[1].split(', ');
            const translateY = parseFloat(values[5]); // Y translation is the 6th value
            
            // If the Y translation is negative (going above viewport), fix it
            if (translateY < 10) {
              const newTransform = transform.replace(
                /translate3d\([^)]+\)/,
                `translate3d(${values[0]}, ${Math.max(translateY, 10)}px, ${values[2]})`
              );
              (wrapper as HTMLElement).style.transform = newTransform;
            }
          }
        }
      });
    };

    // Create a mutation observer to watch for popover elements being added
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.hasAttribute('data-radix-popper-content-wrapper')) {
                // Small delay to ensure the transform is applied
                setTimeout(checkPopoverPosition, 10);
              }
            }
          });
        }
      });
    });

    // Start observing
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check periodically for existing popovers
    const interval = setInterval(checkPopoverPosition, 100);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(interval);
    };
  }, []);
};
