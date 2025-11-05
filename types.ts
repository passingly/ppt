export enum ElementType {
  TITLE = 'TITLE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string;
  x: number; // position from left in %
  y: number; // position from top in %
  width: number; // width in %
  height: number; // height in %
  fontSize?: number; // in rem
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: {
    type: 'color' | 'image';
    value: string; // hex color or image URL
  };
}

export interface Presentation {
  slides: Slide[];
}