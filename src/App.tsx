import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TranslatePage from './pages/TranslatePage';
import StoryReaderPage from './pages/StoryReaderPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import SavedTranslationsPage from './pages/SavedTranslationsPage';
import PageLayout from './components/PageLayout';
import { Toaster } from './components/ui/Toaster';
import { TooltipProvider } from './components/ui/Tooltip';

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/translate" element={<PageLayout><TranslatePage /></PageLayout>} />
          <Route path="/story" element={<PageLayout><StoryReaderPage /></PageLayout>} />
          <Route path="/auth" element={<PageLayout><AuthPage /></PageLayout>} />
          <Route path="/dashboard" element={<PageLayout><DashboardPage /></PageLayout>} />
          <Route path="/saved-translations" element={<PageLayout><SavedTranslationsPage /></PageLayout>} />
        </Routes>
        <Toaster />
      </Router>
    </TooltipProvider>
  );
}

export default App;
