import { beforeEach, describe, expect, it, vi } from 'vitest';

// Tests added by the assistant.

type WalkthroughModule = typeof import('../walkthrough/walkthroughService');

const createConfig =
  (): import('../../types/app/walkthrough').WalkthroughConfig => ({
    id: 'onboarding' as import('../../types/app/walkthrough').WalkthroughId,
    title: 'Onboarding',
    description: 'Walkthrough description',
    steps: [
      {
        id: 'step-1',
        title: 'Hidden Step',
        description: '',
        content: '',
        // Skip the first step to verify start index resolution
        skipIf: () => true,
      },
      {
        id: 'step-2',
        title: 'Visible Step',
        description: '',
        content: '',
      },
      {
        id: 'step-3',
        title: 'Also Skipped',
        description: '',
        content: '',
        skipIf: () => true,
      },
    ],
  });

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe('walkthroughService', () => {
  it('starts at first non-skipped step and notifies subscribers', async () => {
    const module: WalkthroughModule = await import('../walkthrough/walkthroughService');
    const { walkthroughService } = module;

    const states: Array<ReturnType<typeof walkthroughService.getState>> = [];
    const unsubscribe = walkthroughService.subscribe(state => {
      states.push(state);
    });

    walkthroughService.startWalkthrough(createConfig());

    const state = walkthroughService.getState();
    expect(state.isActive).toBe(true);
    expect(state.currentStepIndex).toBe(1);
    expect(walkthroughService.getCurrentStep()?.id).toBe('step-2');

    // Initial push + startWalkthrough update
    expect(states.length).toBeGreaterThanOrEqual(2);
    unsubscribe();
  });

  it('skips subsequent steps and completes when reaching end', async () => {
    const module: WalkthroughModule = await import('../walkthrough/walkthroughService');
    const { walkthroughService } = module;

    walkthroughService.startWalkthrough(createConfig());

    walkthroughService.nextStep();
    const state = walkthroughService.getState();

    expect(state.isCompleted).toBe(true);
    expect(state.isActive).toBe(false);

    // Service should report completion via helper
    expect(walkthroughService.isCompleted('onboarding' as never)).toBe(true);
  });

  it('supports skipping a walkthrough and records it', async () => {
    const module: WalkthroughModule = await import('../walkthrough/walkthroughService');
    const { walkthroughService } = module;

    walkthroughService.startWalkthrough(createConfig());
    walkthroughService.skipWalkthrough();

    const state = walkthroughService.getState();
    expect(state.isSkipped).toBe(true);
    expect(state.isActive).toBe(false);
  });

  it('can reset a walkthrough in storage', async () => {
    const module: WalkthroughModule = await import('../walkthrough/walkthroughService');
    const { walkthroughService } = module;

    walkthroughService.startWalkthrough(createConfig());
    walkthroughService.skipWalkthrough();
    walkthroughService.resetWalkthrough('onboarding' as never);
    expect(walkthroughService.isSkipped('onboarding' as never)).toBe(false);
  });
});
