import { GoogleGenAI, Type } from "@google/genai";
import type { Presentation } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const backgroundSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['color', 'image'] },
        value: { type: Type.STRING, description: "If type is 'color', a hex code. If type is 'image', a concise Unsplash search query for a background image (e.g., 'abstract blue gradient')." }
    },
    required: ['type', 'value']
};


const presentationSchema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      description: "An array of slide objects.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the slide." },
          background: backgroundSchema,
          elements: {
            type: Type.ARRAY,
            description: "Array of elements on the slide.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique identifier for the element." },
                type: { type: Type.STRING, enum: ['TITLE', 'TEXT', 'IMAGE'], description: "Type of the element." },
                content: { type: Type.STRING, description: "For TEXT/TITLE, the text content. For IMAGE, a concise Unsplash search query (e.g., 'happy business team'). Use '• ' for bullet points separated by '\\n'." },
                x: { type: Type.NUMBER, description: "Horizontal position from left as a percentage (0-100)." },
                y: { type: Type.NUMBER, description: "Vertical position from top as a percentage (0-100)." },
                width: { type: Type.NUMBER, description: "Width of the element as a percentage (0-100)." },
                height: { type: Type.NUMBER, description: "Height of the element as a percentage (0-100)." },
                fontSize: { type: Type.NUMBER, description: "Font size in rem units (e.g., 3 for titles)." },
                fontWeight: { type: Type.STRING, enum: ['bold', 'normal'], description: "Font weight." },
                textAlign: { type: Type.STRING, enum: ['left', 'center', 'right'], description: "Text alignment." },
              },
              required: ['id', 'type', 'content', 'x', 'y', 'width', 'height'],
            },
          },
        },
        required: ['id', 'background', 'elements'],
      },
    },
  },
  required: ['slides'],
};

function getImageUrlFromQuery(query: string): string {
  const sanitizedQuery = encodeURIComponent(query.trim().replace(/\s+/g, ','));
  return `https://source.unsplash.com/1280x720/?${sanitizedQuery}&${Math.random()}`;
}


export const generatePresentation = async (topic: string): Promise<Presentation> => {
  const prompt = `
    You are an expert presentation designer and content creator. Your task is to generate a visually engaging and informative presentation on the topic: "${topic}".
    The output must be a valid JSON object that adheres to the provided schema.
    Generate 5-7 slides, including a title slide, several content slides, and a concluding slide.

    Design Guidelines:
    1.  **Theme:** Create a cohesive visual theme. All slide backgrounds should feel like they belong together.
    2.  **Backgrounds:** For each slide, define a 'background' object. It can be a simple 'color' or an 'image'. For images, provide a concise but descriptive search query in the 'value' field. Example: 'dark blue geometric pattern'.
    3.  **Content:** Create clear and concise text content. Use bullet points for 'TEXT' elements ('• ' prefix, separated by '\\n').
    4.  **Images:** On 2-3 of the content slides, add one 'IMAGE' element to visually support the text. The 'content' for the image should be a descriptive search query. Example: 'solar panels on a modern roof'.
    5.  **Layout:** Arrange elements professionally. Titles at the top, text below. Place images thoughtfully, ensuring they don't obscure text. Leave adequate white space. Avoid clutter.

    For the topic "${topic}", generate the presentation now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: presentationSchema,
      }
    });

    const jsonText = response.text.trim();
    const presentationWithPrompts = JSON.parse(jsonText);

    if (!presentationWithPrompts || !Array.isArray(presentationWithPrompts.slides)) {
        throw new Error("Invalid presentation structure received from AI.");
    }
    
    // Replace prompts with actual image URLs
    const finalPresentation: Presentation = {
        ...presentationWithPrompts,
        slides: presentationWithPrompts.slides.map((slide: any) => {
            let finalBackground = slide.background;
            if (slide.background && slide.background.type === 'image') {
                finalBackground = {
                    ...slide.background,
                    value: getImageUrlFromQuery(slide.background.value),
                };
            }

            const finalElements = slide.elements.map((element: any) => {
                if (element.type === 'IMAGE') {
                    return {
                        ...element,
                        content: getImageUrlFromQuery(element.content),
                    };
                }
                return element;
            });
            
            return { ...slide, background: finalBackground, elements: finalElements };
        })
    };


    return finalPresentation as Presentation;

  } catch (error) {
    console.error("Error generating presentation:", error);
    throw new Error("Failed to generate presentation from Gemini API.");
  }
};