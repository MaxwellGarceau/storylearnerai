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
    console.log(`🔍 Current location object:`, location);
    
    // Stop any active walkthrough when navigating away from its page
    const currentState = walkthroughService.getState();
    console.log(`📊 Current walkthrough state:`, currentState);
    if (currentState.isActive) {
      const currentConfig = walkthroughService.getCurrentConfig();
      if (currentConfig) {
        // Define which walkthrough belongs to which route
        const walkthroughRouteMap: Record<WalkthroughId, string> = {
          'home-walkthrough': '/',
          'translate-walkthrough': '/translate',
          'story-walkthrough': '/story',
        };
        
        const expectedRoute = walkthroughRouteMap[currentConfig.id as WalkthroughId];
        if (expectedRoute && pathname !== expectedRoute) {
          console.log(`🚪 User navigated away from ${expectedRoute} to ${pathname}, stopping walkthrough`);
          stopWalkthrough();
          return; // Don't start a new walkthrough immediately
        }
      }
    }
    
    // Define route to walkthrough mapping
    const routeWalkthroughMap: Record<string, WalkthroughId> = {
      '/': 'home-walkthrough',
      '/translate': 'translate-walkthrough',
      '/story': 'story-walkthrough',
    };

    const walkthroughId = routeWalkthroughMap[pathname];
    console.log(`🎯 Route ${pathname} maps to walkthrough: ${walkthroughId}`);
    
    if (!walkthroughId) {
      console.log(`📍 No walkthrough defined for route: ${pathname}`);
      return;
    }

    const config = walkthroughConfigs[walkthroughId];
    console.log(`📋 Walkthrough config lookup for ${walkthroughId}:`, config ? 'Found' : 'Not found');
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
      pathname,
      configSteps: config.steps.length,
      configAutoStart: config.autoStart
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
    console.log(`🔍 Checking for target elements in ${config.steps.length} steps...`);
    
    // Small delay to ensure page is fully loaded and elements are available
    const timer = setTimeout(() => {
      // Find the first visible step (not skipped)
      let firstVisibleStep = null;
      let firstVisibleIndex = 0;
      
      console.log(`🔍 Checking ${config.steps.length} steps for visibility...`);
      for (let i = 0; i < config.steps.length; i++) {
        const step = config.steps[i];
        const shouldSkip = step?.skipIf?.();
        console.log(`  Step ${i}: ${step?.id} - skipIf: ${shouldSkip}`);
        if (!shouldSkip) {
          firstVisibleStep = step;
          firstVisibleIndex = i;
          console.log(`  ✅ Found first visible step: ${step?.id} at index ${i}`);
          break;
        }
      }
      
      if (firstVisibleStep) {
        console.log(`🎯 Looking for target element: ${firstVisibleStep.targetSelector}`);
        const targetElement = document.querySelector(firstVisibleStep.targetSelector);
        console.log(`🎯 Target element found: ${!!targetElement}`);
        if (targetElement) {
          console.log(`🎬 Auto-starting walkthrough: ${walkthroughId} at step ${firstVisibleIndex}`);
          startWalkthrough(config);
        } else {
          console.warn(`⚠️ Target element not found for first visible step: ${firstVisibleStep.targetSelector}`);
          // Retry after a longer delay
          const retryTimer = setTimeout(() => {
            const retryElement = document.querySelector(firstVisibleStep.targetSelector);
            if (retryElement) {
              console.log(`🔄 Retrying walkthrough start: ${walkthroughId}`);
              startWalkthrough(config);
            } else {
              console.error(`❌ Target element still not found after retry: ${firstVisibleStep.targetSelector}`);
            }
          }, 2000);
          return () => clearTimeout(retryTimer);
        }
      } else {
        console.log(`🎯 All steps are skipped for walkthrough: ${walkthroughId}, completing immediately`);
        startWalkthrough(config); // This will complete immediately due to our logic in startWalkthrough
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [location, startWalkthrough, isCompleted, isSkipped, stopWalkthrough]);

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