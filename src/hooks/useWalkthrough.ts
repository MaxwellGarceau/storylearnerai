import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { walkthroughService } from '../lib/walkthroughService';
import { walkthroughConfigs } from '../lib/walkthroughConfigs';
import type { WalkthroughConfig, WalkthroughId } from '../lib/types/walkthrough';

export const useWalkthrough = () => {
  const location = useLocation();

  const startWalkthrough = useCallback((config: WalkthroughConfig) => {
    walkthroughService.startWalkthrough(config);
  }, []);

  const startWalkthroughById = useCallback((id: WalkthroughId) => {
    const config = walkthroughConfigs[id];
    if (config) {
      walkthroughService.startWalkthrough(config);
    }
  }, []);

  const stopWalkthrough = useCallback(() => {
    walkthroughService.stopWalkthrough();
  }, []);

  const nextStep = useCallback(() => {
    walkthroughService.nextStep();
  }, []);

  const previousStep = useCallback(() => {
    walkthroughService.previousStep();
  }, []);

  const skipWalkthrough = useCallback(() => {
    walkthroughService.skipWalkthrough();
  }, []);

  const isCompleted = useCallback((id: WalkthroughId) => {
    return walkthroughService.isCompleted(id);
  }, []);

  const isSkipped = useCallback((id: WalkthroughId) => {
    return walkthroughService.isSkipped(id);
  }, []);

  const resetWalkthrough = useCallback((id: WalkthroughId) => {
    walkthroughService.resetWalkthrough(id);
  }, []);

  const resetAllWalkthroughs = useCallback(() => {
    walkthroughService.resetAllWalkthroughs();
  }, []);

  // Auto-start walkthroughs based on route
  useEffect(() => {
    const pathname = location.pathname;
    
    // Don't auto-start if user has already completed or skipped
    if (pathname === '/' && !isCompleted('home-walkthrough') && !isSkipped('home-walkthrough')) {
      const config = walkthroughConfigs['home-walkthrough'];
      if (config?.autoStart) {
        // Small delay to ensure page is fully loaded
        const timer = setTimeout(() => {
          startWalkthrough(config);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    
    if (pathname === '/translate' && !isCompleted('translate-walkthrough') && !isSkipped('translate-walkthrough')) {
      const config = walkthroughConfigs['translate-walkthrough'];
      if (config?.autoStart) {
        const timer = setTimeout(() => {
          startWalkthrough(config);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    
    if (pathname === '/story' && !isCompleted('story-walkthrough') && !isSkipped('story-walkthrough')) {
      const config = walkthroughConfigs['story-walkthrough'];
      if (config?.autoStart) {
        const timer = setTimeout(() => {
          startWalkthrough(config);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, startWalkthrough, isCompleted, isSkipped]);

  return {
    startWalkthrough,
    startWalkthroughById,
    stopWalkthrough,
    nextStep,
    previousStep,
    skipWalkthrough,
    isCompleted,
    isSkipped,
    resetWalkthrough,
    resetAllWalkthroughs,
    getState: walkthroughService.getState.bind(walkthroughService),
    getCurrentStep: walkthroughService.getCurrentStep.bind(walkthroughService),
    getCurrentConfig: walkthroughService.getCurrentConfig.bind(walkthroughService),
  };
}; 