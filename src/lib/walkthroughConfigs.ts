import type { WalkthroughConfig } from './types/walkthrough';
import { logger } from './logger';

export const homeWalkthrough: WalkthroughConfig = {
  id: 'home-walkthrough',
  title: 'Welcome to Story Learner AI',
  description: 'Let\'s get you started with your language learning journey!',
  steps: [
    {
      id: 'start-translating',
      title: 'Start Translating',
      description: 'Click the "Start Translating" button to begin your first story translation.',
      targetSelector: '[data-testid="start-translating-button"]',
      position: 'bottom',
      highlight: true,
      action: 'click',
      actionText: 'Click to continue',
    },
  ],
  autoStart: true,
  showProgress: true,
  allowSkip: true,
};

const translateWalkthrough: WalkthroughConfig = {
  id: 'translate-walkthrough',
  title: 'Translate Your Story',
  description: 'Learn how to translate stories with AI assistance.',
  steps: [
    {
      id: 'copy-paste-story',
      title: 'Copy & Paste Your Story',
      description: 'Copy and paste a story into the translation text area. You can use any story in Spanish or English (more languages coming soon).',
      targetSelector: '[data-testid="story-textarea"], textarea',
      position: 'bottom',
      highlight: true,
      action: 'input',
      actionText: 'Paste your story here',
    },
    {
      id: 'translation-options',
      title: 'Choose Your Settings',
      description: 'Select your target language and difficulty level. The difficulty affects vocabulary complexity and grammar structures.',
      targetSelector: '[data-testid="translation-options"], .translation-options',
      position: 'left',
      highlight: true,
      action: 'none',
      actionText: 'Review your options',
    },
    {
      id: 'click-translate',
      title: 'Click Translate Button',
      description: 'Click the translate button to process your story with AI. You\'ll get a translation with explanations and vocabulary help.',
      targetSelector: '[data-testid="translate-button"]',
      position: 'top',
      highlight: true,
      action: 'click',
      actionText: 'Click to translate',
    },
  ],
  autoStart: true,
  showProgress: true,
  allowSkip: true,
};

// Helper for walkthrough configs to check user sign-in
function isUserSignedIn() {
  // Check for any Supabase auth-related localStorage keys
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('sb-')
  );
  const hasAuthData = supabaseKeys.length > 0;
  
  logger.debug('walkthrough', 'isUserSignedIn check', {
    supabaseKeys,
    hasAuthData,
    allLocalStorageKeys: Object.keys(localStorage).filter(key => key.includes('supabase'))
  });
  
  return hasAuthData;
}

const storyWalkthrough: WalkthroughConfig = {
  id: 'story-walkthrough',
  title: 'Save Your Translation',
  description: 'Learn how to save translations and create an account.',
  steps: [
    {
      id: 'create-account',
      title: 'Make an Account',
      description: 'Create a free account to save translations and track your progress. Click the sign up button to get started.',
      targetSelector: '[data-testid="sign-up-link"]',
      position: 'top',
      highlight: true,
      action: 'click',
      actionText: 'Sign up for free',
      skipIf: isUserSignedIn,
    },
    {
      id: 'save-translation',
      title: 'Save Your Translation',
      description: 'Click here to save this translation to your account. This lets you access it later and track your learning progress.',
      targetSelector: '[data-testid="save-translation-button"]',
      position: 'bottom',
      highlight: true,
      action: 'click',
      actionText: 'Save this translation',
    },
    {
      id: 'dashboard-link',
      title: 'Go to Your Dashboard',
      description: 'You are signed in! Click here to view your dashboard and see your saved translations.',
      targetSelector: '[data-testid="dashboard-link"], a[href="/dashboard"]',
      position: 'top',
      highlight: true,
      action: 'click',
      actionText: 'Go to Dashboard',
      skipIf: () => !isUserSignedIn(),
    },
  ],
  autoStart: true,
  showProgress: true,
  allowSkip: true,
};

export const walkthroughConfigs: Record<string, WalkthroughConfig> = {
  'home-walkthrough': homeWalkthrough,
  'translate-walkthrough': translateWalkthrough,
  'story-walkthrough': storyWalkthrough,
}; 