// pages/Home.tsx
import React from 'react';
import Layout from '../components/Layout';
import StoryUploadForm from '../components/story/StoryUploadForm';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Story Learner AI</h2>
        <StoryUploadForm />
      </div>
    </Layout>
  );
};

export default Home;
