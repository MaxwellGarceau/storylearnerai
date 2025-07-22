# Routing System Documentation

## Overview

The Story Learner AI application now uses React Router for client-side routing, providing a better user experience with proper URL navigation and browser history management.

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
// App.tsx
<Router>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/translate" element={<TranslatePage />} />
    <Route path="/story" element={<StoryReaderPage />} />
  </Routes>
</Router>
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