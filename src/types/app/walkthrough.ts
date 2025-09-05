import type { VoidFunction } from '../common';

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
  action?: 'click' | 'input' | 'scroll' | 'none';
  actionText?: string;
  skipIf?: () => boolean;
  onComplete?: VoidFunction;
}

export interface WalkthroughConfig {
  id: string;
  title: string;
  description: string;
  steps: WalkthroughStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  storageKey?: string;
}

export interface WalkthroughState {
  isActive: boolean;
  currentStepIndex: number;
  isCompleted: boolean;
  isSkipped: boolean;
}

export type WalkthroughId =
  | 'home-walkthrough'
  | 'translate-walkthrough'
  | 'story-walkthrough'
  | 'onboarding';

export interface WalkthroughStorage {
  completed: WalkthroughId[];
  skipped: WalkthroughId[];
  lastCompleted?: Date;
}
