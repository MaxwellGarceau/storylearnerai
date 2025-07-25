import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { walkthroughService } from '../lib/walkthroughService';
import { walkthroughConfigs } from '../lib/walkthroughConfigs';
import type { WalkthroughConfig, WalkthroughId } from '../lib/types/walkthrough';

export const useWalkthrough = () => {
  const location = useLocation();

  const startWalkthrough = useCallback((config: WalkthroughConfig) => {
    console.log(`🎯 Starting walkthrough: ${config.title} (${config.id})`);
    walkthroughService.startWalkthrough(config);
  }, []);

  const startWalkthroughById = useCallback((id: WalkthroughId) => {
    const config = walkthroughConfigs[id];
    if (config) {
      console.log(`🎯 Starting walkthrough by ID: ${id}`);
      walkthroughService.startWalkthrough(config);
    } else {
      console.warn(`❌ Walkthrough config not found for ID: ${id}`);
    }
  }, []);

  const stopWalkthrough = useCallback(() => {
    console.log('🛑 Stopping walkthrough');
    walkthroughService.stopWalkthrough();
  }, []);

  const nextStep = useCallback(() => {
    walkthroughService.nextStep();
  }, []);

  const previousStep = useCallback(() => {
    walkthroughService.previousStep();
  }, []);

  const skipWalkthrough = useCallback(() => {
    const currentConfig = walkthroughService.getCurrentConfig();
    console.log(`⏭️ Skipping walkthrough: ${currentConfig?.id}`);
    walkthroughService.skipWalkthrough();
  }, []);

  const isCompleted = useCallback((id: WalkthroughId) => {
    return walkthroughService.isCompleted(id);
  }, []);

  const isSkipped = useCallback((id: WalkthroughId) => {
    return walkthroughService.isSkipped(id);
  }, []);

  const resetWalkthrough = useCallback((id: WalkthroughId) => {
    console.log(`🔄 Resetting walkthrough: ${id}`);
    walkthroughService.resetWalkthrough(id);
  }, []);

  const resetAllWalkthroughs = useCallback(() => {
    console.log('🔄 Resetting all walkthroughs');
    walkthroughService.resetAllWalkthroughs();
  }, []);

  // Auto-start walkthroughs based on route
  useEffect(() => {
    const pathname = location.pathname;
    console.log(`🗺️ Route changed to: ${pathname}`);
    
    // Define route to walkthrough mapping
    const routeWalkthroughMap: Record<string, WalkthroughId> = {
      '/': 'home-walkthrough',
      '/translate': 'translate-walkthrough',
      '/story': 'story-walkthrough',
    };

    const walkthroughId = routeWalkthroughMap[pathname];
    
    if (!walkthroughId) {
      console.log(`📍 No walkthrough defined for route: ${pathname}`);
      return;
    }

    const config = walkthroughConfigs[walkthroughId];
    if (!config) {
      console.warn(`❌ Walkthrough config not found for: ${walkthroughId}`);
      return;
    }

    const completed = isCompleted(walkthroughId);
    const skipped = isSkipped(walkthroughId);
    const shouldAutoStart = config.autoStart;

    console.log(`📊 Walkthrough status for ${walkthroughId}:`, {
      completed,
      skipped,
      shouldAutoStart,
      pathname
    });

    // Don't auto-start if user has already completed or skipped
    if (completed) {
      console.log(`✅ Walkthrough already completed: ${walkthroughId}`);
      return;
    }

    if (skipped) {
      console.log(`⏭️ Walkthrough was skipped: ${walkthroughId}`);
      return;
    }

    if (!shouldAutoStart) {
      console.log(`🚫 Auto-start disabled for: ${walkthroughId}`);
      return;
    }

    console.log(`⏰ Scheduling walkthrough start: ${walkthroughId}`);
    
    // Small delay to ensure page is fully loaded and elements are available
    const timer = setTimeout(() => {
      // Double-check that elements exist before starting
      const firstStep = config.steps[0];
      if (firstStep) {
        const targetElement = document.querySelector(firstStep.targetSelector);
        if (targetElement) {
          console.log(`🎬 Auto-starting walkthrough: ${walkthroughId}`);
          startWalkthrough(config);
        } else {
          console.warn(`⚠️ Target element not found for first step: ${firstStep.targetSelector}`);
          // Retry after a longer delay
          const retryTimer = setTimeout(() => {
            const retryElement = document.querySelector(firstStep.targetSelector);
            if (retryElement) {
              console.log(`🔄 Retrying walkthrough start: ${walkthroughId}`);
              startWalkthrough(config);
            } else {
              console.error(`❌ Target element still not found after retry: ${firstStep.targetSelector}`);
            }
          }, 2000);
          return () => clearTimeout(retryTimer);
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
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