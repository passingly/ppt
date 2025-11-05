
import React, { useState } from 'react';
import { WandIcon } from './Icons';

interface InitialPromptProps {
  onGenerate: (topic: string) => void;
}

const InitialPrompt: React.FC<InitialPromptProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-xl p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <WandIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Presentation Maker</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            What topic would you like to create a presentation about?
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The Future of Renewable Energy'"
            className="w-full px-5 py-3 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!topic.trim()}
            className="w-full flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
          >
            <WandIcon className="w-5 h-5 mr-2 -ml-1" />
            Generate Presentation
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialPrompt;
