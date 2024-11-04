// pages/Home.tsx
import React from 'react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">This is the layout page</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Layout using TypeScript and ShadCN (Tailwind/Radix UI).
        </p>
      </div>
    </Layout>
  );
};

export default Home;
