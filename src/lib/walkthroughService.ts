import type { 
  WalkthroughConfig, 
  WalkthroughState, 
  WalkthroughId, 
  WalkthroughStorage,
  WalkthroughStep 
} from '../types/app/walkthrough';
import { logger } from './logger';

class WalkthroughService {
  private static instance: WalkthroughService;
  private currentWalkthrough: WalkthroughConfig | null = null;
  private state: WalkthroughState = {
    isActive: false,
    currentStepIndex: 0,
    isCompleted: false,
    isSkipped: false,
  };
  private listeners: Set<(state: WalkthroughState) => void> = new Set();

  private constructor() {
    this.loadStorage();
  }

  static getInstance(): WalkthroughService {
    if (!WalkthroughService.instance) {
      WalkthroughService.instance = new WalkthroughService();
    }
    return WalkthroughService.instance;
  }

  private getStorageKey(): string {
    return 'storylearnerai-walkthroughs';
  }

  private loadStorage(): WalkthroughStorage {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        return JSON.parse(stored) as WalkthroughStorage;
      }
    } catch (error) {
      logger.warn('walkthrough', 'Failed to load walkthrough storage', { error });
    }
    return { completed: [], skipped: [] };
  }

  private saveStorage(storage: WalkthroughStorage): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(storage));
    } catch (error) {
      logger.warn('walkthrough', 'Failed to save walkthrough storage', { error });
    }
  }

  private notifyListeners(): void {
    // Always pass a new object to ensure React detects state changes
    // This prevents React from ignoring updates due to same object reference
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  subscribe(listener: (state: WalkthroughState) => void): () => void {
    this.listeners.add(listener);
    // Pass a new object to ensure React detects the initial state
    listener({ ...this.state });
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  startWalkthrough(config: WalkthroughConfig): void {
    logger.info('walkthrough', `startWalkthrough called for: ${config.id}`);
    
    // Check if walkthrough is already completed
    const storage = this.loadStorage();
    logger.debug('walkthrough', 'Current storage state', { storage });
    if (storage.completed.includes(config.id as WalkthroughId)) {
      logger.info('walkthrough', `Walkthrough already completed: ${config.id}`);
      return;
    }

    this.currentWalkthrough = config;
    
    // Find the first visible step (not skipped)
    let firstVisibleIndex = 0;
    while (
      firstVisibleIndex < config.steps.length &&
      config.steps[firstVisibleIndex]?.skipIf?.()
    ) {
      logger.debug('walkthrough', `Skipping step ${firstVisibleIndex}`, { stepId: config.steps[firstVisibleIndex]?.id });
      firstVisibleIndex++;
    }

    // If all steps are skipped, complete the walkthrough immediately
    if (firstVisibleIndex >= config.steps.length) {
      logger.info('walkthrough', `All steps skipped for walkthrough: ${config.id}, completing immediately`);
      this.completeWalkthrough();
      return;
    }

    logger.info('walkthrough', `Starting walkthrough at step ${firstVisibleIndex}`, { stepId: config.steps[firstVisibleIndex]?.id });

    this.state = {
      isActive: true,
      currentStepIndex: firstVisibleIndex,
      isCompleted: false,
      isSkipped: false,
    };
    this.notifyListeners();
  }

  nextStep(): void {
    if (!this.currentWalkthrough || !this.state.isActive) return;

    const currentStep = this.currentWalkthrough.steps[this.state.currentStepIndex];
    if (currentStep?.onComplete) {
      currentStep.onComplete();
    }

    let nextIndex = this.state.currentStepIndex + 1;
    // Skip steps with skipIf returning true
    while (
      nextIndex < this.currentWalkthrough.steps.length &&
      this.currentWalkthrough.steps[nextIndex]?.skipIf?.()
    ) {
      nextIndex++;
    }

    if (nextIndex < this.currentWalkthrough.steps.length) {
      this.state = { ...this.state, currentStepIndex: nextIndex };
      this.notifyListeners();
    } else {
      this.completeWalkthrough();
    }
  }

  previousStep(): void {
    if (!this.currentWalkthrough || !this.state.isActive) return;

    let prevIndex = this.state.currentStepIndex - 1;
    // Skip steps with skipIf returning true (going backwards)
    while (
      prevIndex >= 0 &&
      this.currentWalkthrough.steps[prevIndex]?.skipIf?.()
    ) {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      this.state = { ...this.state, currentStepIndex: prevIndex };
      this.notifyListeners();
    }
  }

  skipWalkthrough(): void {
    if (!this.currentWalkthrough || !this.state.isActive) return;

    this.state.isSkipped = true;
    this.state.isActive = false;
    
    const storage = this.loadStorage();
    storage.skipped.push(this.currentWalkthrough.id as WalkthroughId);
    this.saveStorage(storage);
    
    this.notifyListeners();
    this.currentWalkthrough = null;
  }

  completeWalkthrough(): void {
    if (!this.currentWalkthrough || !this.state.isActive) return;

    this.state = {
      ...this.state,
      isCompleted: true,
      isActive: false,
    };
    
    const storage = this.loadStorage();
    storage.completed.push(this.currentWalkthrough.id as WalkthroughId);
    storage.lastCompleted = new Date();
    this.saveStorage(storage);
    
    this.notifyListeners();
    this.currentWalkthrough = null;
  }

  stopWalkthrough(): void {
    this.state.isActive = false;
    this.currentWalkthrough = null;
    this.notifyListeners();
  }

  getCurrentStep(): WalkthroughStep | null {
    if (!this.currentWalkthrough || !this.state.isActive) return null;
    
    const currentStep = this.currentWalkthrough.steps[this.state.currentStepIndex];
    
    // If the current step should be skipped, return null
    if (currentStep?.skipIf?.()) {
      return null;
    }
    
    return currentStep || null;
  }

  getCurrentConfig(): WalkthroughConfig | null {
    return this.currentWalkthrough;
  }

  getState(): WalkthroughState {
    return { ...this.state };
  }

  isCompleted(walkthroughId: WalkthroughId): boolean {
    const storage = this.loadStorage();
    return storage.completed.includes(walkthroughId);
  }

  isSkipped(walkthroughId: WalkthroughId): boolean {
    const storage = this.loadStorage();
    return storage.skipped.includes(walkthroughId);
  }

  resetWalkthrough(walkthroughId: WalkthroughId): void {
    logger.info('walkthrough', `Resetting walkthrough: ${walkthroughId}`);
    const storage = this.loadStorage();
    storage.completed = storage.completed.filter(id => id !== walkthroughId);
    storage.skipped = storage.skipped.filter(id => id !== walkthroughId);
    this.saveStorage(storage);
    logger.info('walkthrough', `Walkthrough reset: ${walkthroughId}`);
  }

  resetAllWalkthroughs(): void {
    const storage: WalkthroughStorage = { completed: [], skipped: [] };
    this.saveStorage(storage);
  }
}

export const walkthroughService = WalkthroughService.getInstance();

// Global function for debugging walkthroughs
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).resetWalkthrough = (id: string) => {
    logger.info('walkthrough', `Resetting walkthrough from console: ${id}`);
    walkthroughService.resetWalkthrough(id as WalkthroughId);
  };
  
  (window as unknown as Record<string, unknown>).startWalkthrough = (id: string) => {
    logger.info('walkthrough', `Starting walkthrough from console: ${id}`);
    void import('./walkthroughConfigs').then(({ walkthroughConfigs }) => {
      const config = walkthroughConfigs[id];
      if (config) {
        walkthroughService.startWalkthrough(config);
      } else {
        logger.error('walkthrough', `Walkthrough config not found: ${id}`);
      }
    });
  };
} 