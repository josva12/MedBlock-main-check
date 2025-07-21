import React from 'react';
import AIChatWidget from '../../components/ai/AIChatWidget';

const AIPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <AIChatWidget />
    </div>
  );
};

export default AIPage;
