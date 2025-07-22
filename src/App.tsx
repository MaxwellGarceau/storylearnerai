import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TranslatePage from './pages/TranslatePage';
import StoryReaderPage from './pages/StoryReaderPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/translate" element={<TranslatePage />} />
        <Route path="/story" element={<StoryReaderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
