import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TranslatePage from './pages/TranslatePage';
import StoryReaderPage from './pages/StoryReaderPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import SavedTranslationsPage from './pages/SavedTranslationsPage';
import Layout from './components/Layout';
import { Toaster } from './components/ui/Toaster';
import { TooltipProvider } from './components/ui/Tooltip';

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/story" element={<StoryReaderPage />} />
          <Route path="/auth" element={<Layout><AuthPage /></Layout>} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/saved-translations" element={<Layout><SavedTranslationsPage /></Layout>} />
        </Routes>
        <Toaster />
      </Router>
    </TooltipProvider>
  );
}

export default App;
