import { useState, useEffect } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallLandscape: boolean;
}

export const useViewport = (): ViewportDimensions => {
  const [viewport, setViewport] = useState<ViewportDimensions>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      width,
      height,
      isLandscape: width > height,
      isPortrait: height > width,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isSmallLandscape: width > height && height < 600,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isLandscape: width > height,
        isPortrait: height > width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallLandscape: width > height && height < 600,
      });
    };

    // Set initial viewport
    handleResize();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
};
