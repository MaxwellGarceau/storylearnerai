# Walkthrough System Documentation

## Overview

The Walkthrough System provides an interactive user onboarding experience that guides new users through the key features of StoryLearner AI. It uses popover tooltips, a spotlight highlight overlay, and step-by-step instructions. It auto-starts by route and persists completion/skips in localStorage.

## Features

- **Interactive Tooltips**: Overlay cards that appear next to UI elements
- **Element Highlighting**: Visual highlighting of target elements with glow effects
- **Progress Tracking**: Shows current step and total progress
- **Persistent Storage**: Remembers completed and skipped walkthroughs
- **Auto-start**: Automatically starts walkthroughs based on user's current page
- **Skip Functionality**: Users can skip walkthroughs if desired
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Core Components

1. **WalkthroughService** (`src/lib/walkthrough/walkthroughService.ts`)
   - Singleton service that manages walkthrough state
   - Handles storage, navigation, and event management
   - Provides subscription-based state updates

2. **Walkthrough** (`src/components/walkthrough/Walkthrough.tsx`)
   - UI component that displays popovers and the spotlight overlay
   - Debounced scroll/resize updates to reduce jumps
   - Ensures the overlay stays within viewport bounds

3. **useWalkthrough Hook** (`src/hooks/useWalkthrough.ts`)
   - React hook for easy walkthrough integration
   - Provides auto-start functionality based on routes
   - Exposes walkthrough control methods

4. **WalkthroughConfigs** (`src/lib/walkthrough/walkthroughConfigs.ts`)
   - Predefined walkthrough configurations
   - Step definitions with targeting and positioning

### File Structure

```
src/
├── lib/
│   ├── types/app/walkthrough.ts           # TypeScript type definitions
│   └── walkthrough/
│       ├── walkthroughService.ts          # Core service logic
│       └── walkthroughConfigs.ts          # Walkthrough configurations
├── hooks/
│   └── useWalkthrough.ts                  # React hook (route auto-start)
├── components/walkthrough/
│   ├── Walkthrough.tsx                    # Overlay + popover component
│   └── WalkthroughDebug.tsx               # Debug/controls
```

## Usage

### Basic Integration

The walkthrough system is automatically integrated into the main App component:

```tsx
// src/App.tsx
import { Walkthrough } from '@/components/walkthrough/Walkthrough';
import { WalkthroughDebug } from '@/components/walkthrough/WalkthroughDebug';
import { useWalkthrough } from '@/hooks/useWalkthrough';

function AppContent() {
  useWalkthrough();
  const showDebug =
    process.env.NODE_ENV === 'development' &&
    window.location.search.includes('debug=walkthrough');
  return (
    <>
      {/* Routes here */}
      <Walkthrough />
      <WalkthroughDebug show={showDebug} />
    </>
  );
}
```

### Manual Walkthrough Control

```tsx
import { useWalkthrough } from '../hooks/useWalkthrough';

function MyComponent() {
  const { startWalkthroughById, stopWalkthrough, isCompleted } =
    useWalkthrough();

  const handleStartWalkthrough = () => {
    startWalkthroughById('home-walkthrough');
  };

  return <button onClick={handleStartWalkthrough}>Start Tutorial</button>;
}
```

### Creating Walkthrough Configurations

```tsx
// src/lib/walkthroughConfigs.ts
export const myWalkthrough: WalkthroughConfig = {
  id: 'my-walkthrough',
  title: 'My Feature Walkthrough',
  description: 'Learn how to use this feature',
  steps: [
    {
      id: 'step-1',
      title: 'First Step',
      description: 'Click this button to get started',
      targetSelector: '[data-testid="my-button"]',
      position: 'bottom',
      highlight: true,
      action: 'click',
      actionText: 'Click the button',
    },
    // ... more steps
  ],
  autoStart: true,
  showProgress: true,
  allowSkip: true,
};
```

## Walkthrough Steps

Each walkthrough step defines:

- **id**: Unique identifier for the step
- **title**: Step title displayed in the tooltip
- **description**: Detailed explanation of what to do
- **targetSelector**: CSS selector to find the target element
- **position**: Tooltip position relative to target ('top', 'bottom', 'left', 'right', 'center')
- **highlight**: Whether to highlight the target element
- **action**: Expected user action ('click', 'input', 'scroll', 'none')
- **actionText**: Text describing the action
- **skipIf**: Optional function to conditionally skip the step
- **onComplete**: Optional callback when step is completed

## Targeting Elements

Elements are targeted using CSS selectors. It's recommended to use `data-testid` attributes:

```tsx
<button data-testid='save-button'>Save</button>
```

Then reference in walkthrough config:

```tsx
{
  targetSelector: '[data-testid="save-button"]',
  // ...
}
```

## Positioning

The popover positions relative to the target, and the overlay uses a `clip-path` spotlight rectangle with padding around the element. Scroll and resize are debounced for stability.

- **top**: Above the element
- **bottom**: Below the element
- **left**: To the left of the element
- **right**: To the right of the element
- **center**: Centered on screen

The system ensures the overlay stays within the viewport bounds.

## Storage

Walkthrough completion status is stored in localStorage:

```json
{
  "completed": ["home-walkthrough", "translate-walkthrough"],
  "skipped": ["story-walkthrough"],
  "lastCompleted": "2024-01-15T10:30:00.000Z"
}
```

## Auto-start Behavior

Walkthroughs automatically start based on the current route:

- **Home page** (`/`): Starts `home-walkthrough`
- **Translate page** (`/translate`): Starts `translate-walkthrough`
- **Story page** (`/story`): Starts `story-walkthrough`

Auto-start only occurs if the walkthrough hasn't been completed or skipped.

## Styling

The walkthrough system includes CSS for highlighting elements:

```css
.walkthrough-highlight {
  @apply relative z-30;
  box-shadow:
    0 0 0 4px hsl(var(--primary) / 0.3),
    0 0 0 8px hsl(var(--primary) / 0.1);
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
}
```

## Testing

The walkthrough system includes comprehensive tests:

```bash
npm run test:once -- src/components/walkthrough/__tests__
```

Tests cover:

- Service functionality
- Hook behavior
- Auto-start logic
- Error handling
- Storage management

## Current Walkthroughs

### Home Walkthrough

- **Target**: "Start Translating" button
- **Purpose**: Guide users to begin their first translation

### Translate Walkthrough

- **Targets**: Story textarea, translation options, translate button
- **Purpose**: Explain how to input stories and configure translation settings

### Story Walkthrough

- **Targets**: Sign up link (if guest), Save translation button, Dashboard link (if signed in)
- **Purpose**: Show users how to save translations and create accounts

## Future Enhancements

- **Custom Animations**: Add entrance/exit animations for tooltips
- **Keyboard Navigation**: Support arrow keys for step navigation
- **Voice Guidance**: Add audio narration for accessibility
- **Analytics**: Track walkthrough completion rates and user behavior
- **A/B Testing**: Test different walkthrough flows
- **Internationalization**: Support multiple languages for walkthrough content

## Best Practices

1. **Use Clear Selectors**: Always use `data-testid` attributes for reliable targeting
2. **Keep Steps Short**: Limit each step to one clear action
3. **Test Responsiveness**: Ensure walkthroughs work on all screen sizes
4. **Provide Skip Option**: Always allow users to skip walkthroughs
5. **Use Descriptive Text**: Make step descriptions clear and actionable
6. **Position Carefully**: Choose tooltip positions that don't obscure important UI
7. **Handle Edge Cases**: Account for missing elements or dynamic content
