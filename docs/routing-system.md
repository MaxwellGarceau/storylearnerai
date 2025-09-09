# Routing System Documentation

## Overview

The app uses React Router for client‑side routing. Core pages are wrapped by a shared `PageLayout`. Auth‑gated pages use `ProtectedRoute`.

## Routes

### `/` - Home Page

- **Component**: `Home`
- **Purpose**: Landing page with application introduction and navigation to translate page
- **Features**:
  - Application title and description
  - "How it works" section explaining the translation process
  - Call-to-action button to start translating

### `/translate` - Translate Page

- **Component**: `TranslatePage`
- **Purpose**: Page where users input stories for translation
- **Features**:
  - Story input form via `StoryContainer` component
  - Navigation to story reader page after successful translation
  - Passes translation data through React Router state

### `/story` - Story Reader Page

- **Component**: `StoryReaderPage`
- **Purpose**: Displays translated stories with side-by-side view
- **Features**:
  - Shows translated story content via `StoryRender` component
  - Handles cases where no translation data is available
  - Navigation buttons to translate another story or go home
  - Receives translation data through React Router location state
  - Uses modular sidebar components from `@sidebar/*`

### `/auth` - Authentication Page

- **Component**: `AuthPage`
- **Purpose**: Sign in/up and manage account access

### `/dashboard` - Dashboard Page (Protected)

- **Component**: `DashboardPage` within `ProtectedRoute`
- **Purpose**: User overview and quick actions

### `/saved-translations` - Saved Translations (Protected)

- **Component**: `SavedTranslationsPage` within `ProtectedRoute`
- **Purpose**: View and manage saved story translations

## Navigation

### Header Navigation

The application header includes:

- **Logo/Brand**: Links to home page (`/`)
- **Home**: Navigation to home page
- **Translate**: Navigation to translate page

### Page Navigation

Each page includes appropriate navigation buttons:

- **Home Page**: "Start Translating" button → `/translate`
- **Translate Page**: Automatically navigates to `/story` after translation
- **Story Reader Page**:
  - "Translate Another Story" → `/translate`
  - "Go Home" → `/`
  - "Translate a Story" (when no data) → `/translate`
  - Vocabulary deep-link: `/translate#vocabulary` opens the sidebar with the Vocabulary tab active

## Components Overview

- Story-related components live under `src/components/story/`.
- Sidebar components are modularized under `src/components/sidebar/` and importable via the `@sidebar/*` alias.

### Sidebar Modules

- `@sidebar/StorySidebar`: Main composed sidebar used on story pages
- `@sidebar/StoriesSection`: Saved and sample stories list
- `@sidebar/VocabularySection`: Vocabulary management view
- `@sidebar/InfoSection`: Translation info and settings summary
- `@sidebar/SidebarHeader`: Title, section tabs, close button
- `@sidebar/SidebarToggle`: Floating button to open sidebar on mobile

Consumer pages updated:

- `src/pages/TranslatePage.tsx`: imports `StorySidebar` from `@sidebar/StorySidebar`
- `src/pages/StoryReaderPage.tsx`: imports `StorySidebar` from `@sidebar/StorySidebar`

## Data Flow

### Translation Data Passing

1. User submits story on `/translate` page
2. `TranslatePage` receives translation response
3. Navigates to `/story` with translation data in location state
4. `StoryReaderPage` reads translation data from location state
5. Displays story content or shows "no story" message if no data

### State Management

- Translation data is passed through React Router's location state
- No global state management required for basic routing
- Future implementation will support story IDs for persistent storage

## Implementation Details

### Router Setup

```typescript
// src/App.tsx
<TooltipProvider>
  <Router>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/translate' element={<PageLayout><TranslatePage /></PageLayout>} />
      <Route path='/story' element={<PageLayout><StoryReaderPage /></PageLayout>} />
      <Route path='/auth' element={<PageLayout><AuthPage /></PageLayout>} />
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <PageLayout><DashboardPage /></PageLayout>
        </ProtectedRoute>
      } />
      <Route path='/saved-translations' element={
        <ProtectedRoute>
          <PageLayout><SavedTranslationsPage /></PageLayout>
        </ProtectedRoute>
      } />
    </Routes>
    <Toaster />
    <Walkthrough />
    <WalkthroughDebug show={showDebug} />
  </Router>
</TooltipProvider>
```

### Navigation Hooks

- `useNavigate()`: Programmatic navigation
- `useLocation()`: Access to current location and state
- `Link`: Declarative navigation components

### Error Handling

- Story reader page gracefully handles missing translation data
- Shows appropriate messaging and navigation options
- Maintains good user experience even with invalid states

## Future Enhancements

### Story ID Support

The routing system is designed to support future story ID functionality:

- Route pattern: `/story/:id`
- Load saved stories from database/storage
- Shareable story URLs
- Bookmark support

### Additional Routes

Potential future routes:

- `/history` - User's translation history
- `/settings` - Application settings
- `/help` - Help and documentation
- `/about` - About the application

## Testing

### Test Coverage

- Route rendering tests
- Navigation functionality tests
- State passing tests
- Error handling tests

### Test Utilities

- `renderWithRouter()` helper for testing components with router context
- Mock implementations for React Router hooks
- Comprehensive test coverage for all routing scenarios

## Walkthrough Integration

- The route-aware `useWalkthrough` hook auto‑starts tutorials for `/`, `/translate`, and `/story`.
- The overlay (`Walkthrough`) and debug panel (`WalkthroughDebug`) are mounted at the app root.

## Best Practices

### URL Design

- RESTful URL patterns
- Descriptive route names
- Consistent navigation structure

### State Management

- Use location state for temporary data passing
- Avoid storing large objects in URL state
- Consider URL parameters for persistent data

### User Experience

- Clear navigation paths
- Consistent button placement
- Proper error states
- Loading states for async operations
