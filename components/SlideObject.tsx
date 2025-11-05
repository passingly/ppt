import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SlideElement } from '../types';
import { ElementType } from '../types';

interface SlideObjectProps {
  element: SlideElement;
  onUpdate: (elementId: string, newProps: Partial<SlideElement>) => void;
  onSelect: (elementId: string) => void;
  isSelected: boolean;
  boundsRef: React.RefObject<HTMLDivElement>;
}

const SlideObject: React.FC<SlideObjectProps> = ({ element, onUpdate, onSelect, isSelected, boundsRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !boundsRef.current) return;

    const bounds = boundsRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    let newX = dragStartRef.current.elementX + (dx / bounds.width) * 100;
    let newY = dragStartRef.current.elementY + (dy / bounds.height) * 100;

    // Constrain to bounds
    newX = Math.max(0, Math.min(newX, 100 - element.width));
    newY = Math.max(0, Math.min(newY, 100 - element.height));
    
    onUpdate(element.id, { x: newX, y: newY });
  }, [isDragging, boundsRef, element.id, element.width, element.height, onUpdate]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    fontSize: element.fontSize ? `${element.fontSize}rem` : '1rem',
    fontWeight: element.fontWeight || 'normal',
    textAlign: element.textAlign || 'left',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    boxSizing: 'border-box',
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(element.id, { content: e.target.value });
  };
  
  const renderContent = () => {
    switch (element.type) {
      case ElementType.TITLE:
      case ElementType.TEXT:
        return (
          <textarea
            value={element.content}
            onChange={handleTextChange}
            className="w-full h-full p-2 bg-transparent resize-none border-none outline-none text-gray-900 dark:text-gray-100"
            style={{
              lineHeight: element.type === ElementType.TITLE ? 1.2 : 1.5,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent editor drag when clicking textarea
          />
        );
      case ElementType.IMAGE:
        return (
          <img
            src={element.content}
            alt="Presentation element"
            className="w-full h-full object-cover pointer-events-none rounded"
            draggable={false}
          />
        );
      default:
        return <div>Unsupported Element</div>;
    }
  };

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      className={`transition-shadow duration-200 ${isSelected ? 'shadow-lg ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {renderContent()}
    </div>
  );
};

export default SlideObject;