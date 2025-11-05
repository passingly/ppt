import React, { useRef } from 'react';
import type { Slide, SlideElement } from '../types';
import SlideObject from './SlideObject';

interface EditorProps {
  slide: Slide;
  onUpdateElement: (elementId: string, newProps: Partial<SlideElement>) => void;
  onSelectElement: (elementId: string | null) => void;
  selectedElementId: string | null;
}

const Editor: React.FC<EditorProps> = ({ slide, onUpdateElement, onSelectElement, selectedElementId }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === editorRef.current) {
      onSelectElement(null);
    }
  };

  const backgroundStyle: React.CSSProperties = slide.background.type === 'image' 
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${slide.background.value}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundColor: slide.background.value,
      };

  return (
    <div
      ref={editorRef}
      onClick={handleEditorClick}
      className="w-full aspect-video bg-white rounded-lg shadow-2xl relative overflow-hidden"
      style={{ 
        ...backgroundStyle,
        maxWidth: '1280px', // Typical presentation width
      }}
    >
      {slide.elements.map(element => (
        <SlideObject
          key={element.id}
          element={element}
          onUpdate={onUpdateElement}
          onSelect={onSelectElement}
          isSelected={selectedElementId === element.id}
          boundsRef={editorRef}
        />
      ))}
    </div>
  );
};

export default Editor;