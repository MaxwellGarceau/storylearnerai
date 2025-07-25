import type { 
  WalkthroughConfig, 
  WalkthroughState, 
  WalkthroughId, 
  WalkthroughStorage,
  WalkthroughStep 
} from './types/walkthrough';

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
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load walkthrough storage:', error);
    }
    return { completed: [], skipped: [] };
  }

  private saveStorage(storage: WalkthroughStorage): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(storage));
    } catch (error) {
      console.warn('Failed to save walkthrough storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: WalkthroughState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  startWalkthrough(config: WalkthroughConfig): void {
    // Check if walkthrough is already completed
    const storage = this.loadStorage();
    if (storage.completed.includes(config.id as WalkthroughId)) {
      return;
    }

    this.currentWalkthrough = config;
    this.state = {
      isActive: true,
      currentStepIndex: 0,
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

    if (this.state.currentStepIndex < this.currentWalkthrough.steps.length - 1) {
      this.state.currentStepIndex++;
      this.notifyListeners();
    } else {
      this.completeWalkthrough();
    }
  }

  previousStep(): void {
    if (!this.currentWalkthrough || !this.state.isActive) return;

    if (this.state.currentStepIndex > 0) {
      this.state.currentStepIndex--;
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
    return this.currentWalkthrough.steps[this.state.currentStepIndex] || null;
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
    const storage = this.loadStorage();
    storage.completed = storage.completed.filter(id => id !== walkthroughId);
    storage.skipped = storage.skipped.filter(id => id !== walkthroughId);
    this.saveStorage(storage);
  }

  resetAllWalkthroughs(): void {
    const storage: WalkthroughStorage = { completed: [], skipped: [] };
    this.saveStorage(storage);
  }
}

export const walkthroughService = WalkthroughService.getInstance(); 