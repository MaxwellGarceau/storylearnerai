// pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Story Learner AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Translate stories from any language to English and enhance your learning experience
        </p>
        
        <div className="space-y-4">
          <Link to="/translate">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md transition-colors text-lg">
              Start Translating
            </Button>
          </Link>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">How it works:</h3>
            <div className="text-left space-y-3 text-gray-600">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</span>
                <p>Enter a story in any language you want to learn from</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</span>
                <p>Our AI translates it to English with detailed explanations</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</span>
                <p>Read and learn with side-by-side translations and vocabulary help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
