import React, { useState, useCallback } from 'react';
import type { Presentation, Slide, SlideElement } from './types';
import { generatePresentation } from './services/geminiService';
import InitialPrompt from './components/InitialPrompt';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import { PlusIcon, TrashIcon } from './components/Icons';

const App: React.FC = () => {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleGeneratePresentation = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setPresentation(null);
    try {
      const pres = await generatePresentation(topic);
      if (pres && pres.slides.length > 0) {
        setPresentation(pres);
        setCurrentSlideIndex(0);
        setSelectedElementId(null);
      } else {
        setError('Failed to generate presentation. The AI returned an empty or invalid structure.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setSelectedElementId(null);
  };

  const updateElement = useCallback((elementId: string, newProps: Partial<SlideElement>) => {
    setPresentation(prev => {
      if (!prev) return null;
      const newSlides = prev.slides.map((slide, index) => {
        if (index !== currentSlideIndex) return slide;
        const newElements = slide.elements.map(el =>
          el.id === elementId ? { ...el, ...newProps } : el
        );
        return { ...slide, elements: newElements };
      });
      return { ...prev, slides: newSlides };
    });
  }, [currentSlideIndex]);

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      background: { type: 'color', value: '#ffffff' },
      elements: [],
    };
    setPresentation(prev => {
        if (!prev) return null;
        const newSlides = [...prev.slides, newSlide];
        return { ...prev, slides: newSlides };
    });
    setCurrentSlideIndex(presentation ? presentation.slides.length : 0);
  };

  const deleteSlide = (index: number) => {
    setPresentation(prev => {
      if (!prev || prev.slides.length <= 1) return prev; // Don't delete the last slide
      const newSlides = prev.slides.filter((_, i) => i !== index);
      return { ...prev, slides: newSlides };
    });
    if (currentSlideIndex >= index) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };


  if (isLoading) {
    return <Loader message="Generating your presentation... This may take a moment." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-red-500 p-4">
        <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!presentation) {
    return <InitialPrompt onGenerate={handleGeneratePresentation} />;
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div className="flex h-screen w-screen bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <Sidebar
        slides={presentation.slides}
        currentSlideIndex={currentSlideIndex}
        onSelectSlide={selectSlide}
        onDeleteSlide={deleteSlide}
      />
      <div className="flex-1 flex flex-col">
        <Toolbar />
        <main className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-center overflow-auto">
          <Editor
            slide={currentSlide}
            onUpdateElement={updateElement}
            onSelectElement={setSelectedElementId}
            selectedElementId={selectedElementId}
          />
           <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={addSlide}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
              >
                <PlusIcon />
                <span>Add Slide</span>
              </button>
              <button
                onClick={() => deleteSlide(currentSlideIndex)}
                disabled={presentation.slides.length <= 1}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <TrashIcon />
                <span>Delete Current Slide</span>
              </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;