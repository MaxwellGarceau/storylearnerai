import { useEffect, useRef } from 'react';

/**
 * Custom hook to safeguard popover positioning
 * Prevents the popover from going above 10px from the viewport top
 */
export const usePopoverSafeguard = () => {
  const observerRef = useRef<MutationObserver | null>(null);
  const processedWrappers = useRef<WeakSet<Element>>(new WeakSet());

  useEffect(() => {
    // Disabled: safeguard is off by default and only enabled when explicitly opted-in.
    const enabled = false;
    if (!enabled) return;

    // Function to check and fix popover positioning
    const checkPopoverPosition = () => {
      const popoverWrappers = document.querySelectorAll(
        '[data-radix-popper-content-wrapper]'
      );

      popoverWrappers.forEach(wrapper => {
        // Skip if we've already processed this wrapper
        if (processedWrappers.current.has(wrapper)) {
          return;
        }

        const computedStyle = window.getComputedStyle(wrapper);
        const transform = computedStyle.transform;

        // Parse the transform matrix to get the Y translation
        if (transform && transform !== 'none') {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);

          let tx: number | null = null;
          let ty: number | null = null;

          if (matrix3dMatch) {
            const values = matrix3dMatch[1].split(/,\s*/);
            // matrix3d has translate at indices 12 (tx) and 13 (ty)
            tx = parseFloat(values[12]);
            ty = parseFloat(values[13]);
          } else if (matrixMatch) {
            const values = matrixMatch[1].split(/,\s*/);
            // matrix has translate at indices 4 (tx) and 5 (ty)
            tx = parseFloat(values[4]);
            ty = parseFloat(values[5]);
          }

          if (tx != null && ty != null) {
            // Only clamp if going too far above the viewport
            if (ty < 10) {
              (wrapper as HTMLElement).style.transform =
                `translate3d(${tx}px, ${Math.max(ty, 10)}px, 0)`;
              processedWrappers.current.add(wrapper);
            }
          }
        }
      });
    };

    // Create a mutation observer to watch for popover elements being added
    observerRef.current = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.hasAttribute('data-radix-popper-content-wrapper')) {
                // Longer delay to allow Radix UI to complete positioning
                setTimeout(checkPopoverPosition, 50);
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

    // Check less frequently and only for emergency cases
    const interval = setInterval(checkPopoverPosition, 500);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(interval);
    };
  }, []);
};
