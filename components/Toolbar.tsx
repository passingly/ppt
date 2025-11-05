
import React from 'react';
import { WandIcon } from './Icons';

const Toolbar: React.FC = () => {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 flex items-center px-6 shadow-md z-10">
      <div className="flex items-center space-x-2">
        <WandIcon className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">AI Presentation Maker</h1>
      </div>
      {/* Add more toolbar buttons here */}
    </header>
  );
};

export default Toolbar;
