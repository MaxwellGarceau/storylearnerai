import type { WalkthroughConfig } from './types/walkthrough';

export const homeWalkthrough: WalkthroughConfig = {
  id: 'home-walkthrough',
  title: 'Welcome to Story Learner AI',
  description: 'Let\'s get you started with your language learning journey!',
  steps: [
    {
      id: 'start-translating',
      title: 'Start Your Journey',
      description: 'Click the "Start Translating" button to begin translating your first story.',
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

export const translateWalkthrough: WalkthroughConfig = {
  id: 'translate-walkthrough',
  title: 'Translate Your Story',
  description: 'Learn how to translate stories with AI assistance.',
  steps: [
    {
      id: 'story-input',
      title: 'Enter Your Story',
      description: 'Copy and paste a story in any language you want to learn from. You can use Spanish or English (more language support is under construction).',
      targetSelector: '[data-testid="story-textarea"], textarea',
      position: 'bottom',
      highlight: true,
      action: 'input',
      actionText: 'Paste a story here',
    },
    {
      id: 'translation-options',
      title: 'Adjust Settings',
      description: 'Choose your target language and difficulty level. The difficulty affects vocabulary complexity and grammar structures.',
      targetSelector: '[data-testid="translation-options"], .translation-options',
      position: 'left',
      highlight: true,
      action: 'none',
      actionText: 'Review options',
    },
    {
      id: 'translate-button',
      title: 'Translate Your Story',
      description: 'Click the translate button to process your story with AI. The translation will include explanations and vocabulary help.',
      targetSelector: '[data-testid="translate-button"], button:contains("Translate")',
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

export const storyWalkthrough: WalkthroughConfig = {
  id: 'story-walkthrough',
  title: 'Reading Your Story',
  description: 'Learn how to save and manage your translated stories.',
  steps: [
    {
      id: 'save-translation',
      title: 'Save Translation',
      description: 'Save this specific translation to your account. You\'ll need to sign in to access your saved translations.',
      targetSelector: '[data-testid="save-translation-button"]',
      position: 'bottom',
      highlight: true,
      action: 'click',
      actionText: 'Save translation',
    },
    {
      id: 'login-prompt',
      title: 'Create an Account',
      description: 'To save translations and track your progress, create a free account. Click the login button to get started.',
      targetSelector: '[data-testid="sign-in-link"], [data-testid="sign-up-link"]',
      position: 'top',
      highlight: true,
      action: 'click',
      actionText: 'Create account',
      skipIf: () => {
        // Skip if user is already logged in
        return !!localStorage.getItem('supabase.auth.token');
      },
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