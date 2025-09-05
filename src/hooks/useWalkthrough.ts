import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { walkthroughService } from '../lib/walkthrough/walkthroughService';
import { walkthroughConfigs } from '../lib/walkthrough/walkthroughConfigs';
import type {
  WalkthroughConfig,
  WalkthroughId,
} from '../types/app/walkthrough';
import { logger } from '../lib/logger';

export const useWalkthrough = () => {
  const location = useLocation();

  const startWalkthrough = useCallback((config: WalkthroughConfig) => {
    logger.info(
      'walkthrough',
      `Starting walkthrough: ${config.title} (${config.id})`
    );
    walkthroughService.startWalkthrough(config);
  }, []);

  const startWalkthroughById = useCallback((id: WalkthroughId) => {
    const config = walkthroughConfigs[id];
    if (config) {
      logger.info('walkthrough', `Starting walkthrough by ID: ${id}`);
      walkthroughService.startWalkthrough(config);
    } else {
      logger.warn('walkthrough', `Walkthrough config not found for ID: ${id}`);
    }
  }, []);

  const stopWalkthrough = useCallback(() => {
    logger.info('walkthrough', 'Stopping walkthrough');
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
    logger.info('walkthrough', `Skipping walkthrough: ${currentConfig?.id}`);
    walkthroughService.skipWalkthrough();
  }, []);

  const isCompleted = useCallback((id: WalkthroughId) => {
    return walkthroughService.isCompleted(id);
  }, []);

  const isSkipped = useCallback((id: WalkthroughId) => {
    return walkthroughService.isSkipped(id);
  }, []);

  const resetWalkthrough = useCallback((id: WalkthroughId) => {
    logger.info('walkthrough', `Resetting walkthrough: ${id}`);
    walkthroughService.resetWalkthrough(id);
  }, []);

  const resetAllWalkthroughs = useCallback(() => {
    logger.info('walkthrough', 'Resetting all walkthroughs');
    walkthroughService.resetAllWalkthroughs();
  }, []);

  // Auto-start walkthroughs based on route
  useEffect(() => {
    const pathname = location.pathname;
    logger.debug('walkthrough', `Route changed to: ${pathname}`);
    logger.debug('walkthrough', 'Current location object', { location });

    // Stop any active walkthrough when navigating away from its page
    const currentState = walkthroughService.getState();
    logger.debug('walkthrough', 'Current walkthrough state', { currentState });
    if (currentState.isActive) {
      const currentConfig = walkthroughService.getCurrentConfig();
      if (currentConfig) {
        // Define which walkthrough belongs to which route
        const walkthroughRouteMap: Record<WalkthroughId, string> = {
          'home-walkthrough': '/',
          'translate-walkthrough': '/translate',
          'story-walkthrough': '/story',
        };

        const expectedRoute =
          walkthroughRouteMap[currentConfig.id as WalkthroughId];
        if (expectedRoute && pathname !== expectedRoute) {
          logger.info(
            'walkthrough',
            `User navigated away from ${expectedRoute} to ${pathname}, stopping walkthrough`
          );
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
    logger.debug(
      'walkthrough',
      `Route ${pathname} maps to walkthrough: ${walkthroughId}`
    );

    if (!walkthroughId) {
      logger.debug(
        'walkthrough',
        `No walkthrough defined for route: ${pathname}`
      );
      return;
    }

    const config = walkthroughConfigs[walkthroughId];
    logger.debug(
      'walkthrough',
      `Walkthrough config lookup for ${walkthroughId}`,
      { found: !!config }
    );
    if (!config) {
      logger.warn(
        'walkthrough',
        `Walkthrough config not found for: ${walkthroughId}`
      );
      return;
    }

    const completed = isCompleted(walkthroughId);
    const skipped = isSkipped(walkthroughId);
    const shouldAutoStart = config.autoStart;

    logger.debug('walkthrough', `Walkthrough status for ${walkthroughId}`, {
      completed,
      skipped,
      shouldAutoStart,
      pathname,
      configSteps: config.steps.length,
      configAutoStart: config.autoStart,
    });

    // Don't auto-start if user has already completed or skipped
    if (completed) {
      logger.info(
        'walkthrough',
        `Walkthrough already completed: ${walkthroughId}`
      );
      return;
    }

    if (skipped) {
      logger.info('walkthrough', `Walkthrough was skipped: ${walkthroughId}`);
      return;
    }

    if (!shouldAutoStart) {
      logger.info('walkthrough', `Auto-start disabled for: ${walkthroughId}`);
      return;
    }

    logger.info(
      'walkthrough',
      `Scheduling walkthrough start: ${walkthroughId}`
    );
    logger.debug(
      'walkthrough',
      `Checking for target elements in ${config.steps.length} steps...`
    );

    // Small delay to ensure page is fully loaded and elements are available
    const timer = setTimeout(() => {
      // Find the first visible step (not skipped)
      let firstVisibleStep = null;
      let firstVisibleIndex = 0;

      logger.debug(
        'walkthrough',
        `Checking ${config.steps.length} steps for visibility...`
      );
      for (let i = 0; i < config.steps.length; i++) {
        const step = config.steps[i];
        const shouldSkip = step?.skipIf?.();
        logger.debug(
          'walkthrough',
          `Step ${i}: ${step?.id} - skipIf: ${shouldSkip}`
        );
        if (!shouldSkip) {
          firstVisibleStep = step;
          firstVisibleIndex = i;
          logger.debug(
            'walkthrough',
            `Found first visible step: ${step?.id} at index ${i}`
          );
          break;
        }
      }

      if (firstVisibleStep) {
        logger.debug(
          'walkthrough',
          `Looking for target element: ${firstVisibleStep.targetSelector}`
        );
        const targetElement = document.querySelector(
          firstVisibleStep.targetSelector
        );
        logger.debug('walkthrough', `Target element found: ${!!targetElement}`);
        if (targetElement) {
          logger.info(
            'walkthrough',
            `Auto-starting walkthrough: ${walkthroughId} at step ${firstVisibleIndex}`
          );
          startWalkthrough(config);
        } else {
          logger.warn(
            'walkthrough',
            `Target element not found for first visible step: ${firstVisibleStep.targetSelector}`
          );
          // Retry after a longer delay
          const retryTimer = setTimeout(() => {
            const retryElement = document.querySelector(
              firstVisibleStep.targetSelector
            );
            if (retryElement) {
              logger.info(
                'walkthrough',
                `Retrying walkthrough start: ${walkthroughId}`
              );
              startWalkthrough(config);
            } else {
              logger.error(
                'walkthrough',
                `Target element still not found after retry: ${firstVisibleStep.targetSelector}`
              );
            }
          }, 2000);
          return () => clearTimeout(retryTimer);
        }
      } else {
        logger.info(
          'walkthrough',
          `All steps are skipped for walkthrough: ${walkthroughId}, completing immediately`
        );
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
    getCurrentConfig:
      walkthroughService.getCurrentConfig.bind(walkthroughService),
  };
};
