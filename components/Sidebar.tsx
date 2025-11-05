import React from 'react';
import type { Slide } from '../types';
import { TrashIcon } from './Icons';

interface SidebarProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ slides, currentSlideIndex, onSelectSlide, onDeleteSlide }) => {
  return (
    <aside className="w-48 bg-white dark:bg-gray-900 p-4 overflow-y-auto shadow-lg flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Slides</h2>
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(index)}
            className={`relative group p-1 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              currentSlideIndex === index ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
            }`}
          >
            <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {index + 1}
            </div>
            <div
              className="aspect-video w-full rounded-md bg-white overflow-hidden shadow-inner"
              style={
                slide.background.type === 'image'
                  ? {
                      backgroundImage: `url('${slide.background.value}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: slide.background.value }
              }
            >
              {/* Thumbnail preview can be added here */}
            </div>
             {slides.length > 1 && (
                <button
                    onClick={(e) => {
                    e.stopPropagation(); // Prevent slide selection
                    onDeleteSlide(index);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                    <TrashIcon className="w-3 h-3" />
                </button>
             )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;