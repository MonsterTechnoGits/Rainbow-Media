import { useEffect, useState } from 'react';

export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return false;

      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as unknown as { opera?: string }).opera ||
        '';
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
      const isSmallScreen = window.innerWidth <= 768;

      return isMobileDevice || isSmallScreen;
    };

    const updateViewport = () => {
      setIsMobile(checkMobile());
      setViewportHeight(window.innerHeight);
    };

    // Initial check
    updateViewport();

    // Listen for resize events
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // For iOS Safari, also listen to visual viewport changes
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  return { isMobile, viewportHeight };
};

export const getMobileDrawerStyles = (
  isMobile: boolean,
  heightPercent = 85,
  minHeightPercent = 60
) => {
  if (!isMobile) {
    return {
      height: `${heightPercent}vh`,
      maxHeight: `${heightPercent}vh`,
      minHeight: `${minHeightPercent}vh`,
    };
  }

  // For mobile, account for safe areas and browser UI
  const safeAreaTop = 'max(env(safe-area-inset-top), 20px)';
  const topOffset = '20px';

  return {
    height: `calc(${heightPercent}vh - ${safeAreaTop} - ${topOffset})`,
    maxHeight: `calc(${heightPercent}vh - ${safeAreaTop} - ${topOffset})`,
    minHeight: `calc(${minHeightPercent}vh - ${safeAreaTop})`,
    marginTop: safeAreaTop,
    // Additional mobile-specific styles
    transform: 'translateZ(0)', // Enable hardware acceleration
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  };
};
