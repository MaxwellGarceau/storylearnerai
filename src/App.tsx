import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TranslatePage from './pages/TranslatePage';
import StoryReaderPage from './pages/StoryReaderPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import SavedTranslationsPage from './pages/SavedTranslationsPage';
import GrammarPage from './pages/GrammarPage';
import PageLayout from './components/PageLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/Toaster';
import { TooltipProvider } from './components/ui/Tooltip';
import { Walkthrough } from './components/walkthrough/Walkthrough';
import { WalkthroughDebug } from './components/walkthrough/WalkthroughDebug';
import { useWalkthrough } from './hooks/useWalkthrough';
// import { usePopoverSafeguard } from './hooks/usePopoverSafeguard';
import './lib/i18n';
import { LanguageFilterProvider } from './hooks/useLanguageFilter';
import { VocabularyProvider } from './contexts/VocabularyContext';

function App() {
  return (
    <TooltipProvider>
      <LanguageFilterProvider>
        <VocabularyProvider>
          <Router>
            <AppContent />
          </Router>
        </VocabularyProvider>
      </LanguageFilterProvider>
    </TooltipProvider>
  );
}

function AppContent() {
  // Initialize walkthrough hook inside Router context
  useWalkthrough();

  // Popover safeguard disabled by default; enable only via explicit opt-in

  // Enable debug panel in development or when needed
  const showDebug =
    process.env.NODE_ENV === 'development' &&
    window.location.search.includes('debug=walkthrough');

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/translate'
          element={
            <PageLayout>
              <TranslatePage />
            </PageLayout>
          }
        />
        <Route
          path='/story'
          element={
            <PageLayout>
              <StoryReaderPage />
            </PageLayout>
          }
        />
        <Route
          path='/auth'
          element={
            <PageLayout>
              <AuthPage />
            </PageLayout>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <PageLayout>
                <DashboardPage />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/saved-translations'
          element={
            <ProtectedRoute>
              <PageLayout>
                <SavedTranslationsPage />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/grammar'
          element={
            <PageLayout>
              <GrammarPage />
            </PageLayout>
          }
        />
      </Routes>
      <Toaster />
      <Walkthrough />
      <WalkthroughDebug show={showDebug} />
    </>
  );
}

export default App;
