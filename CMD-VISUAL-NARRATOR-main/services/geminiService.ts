import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryImage, StoryResponse, User } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateStoryFromImages = async (images: StoryImage[], user?: User): Promise<StoryResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare the prompt parts: Interleave images with user notes
  const promptParts: any[] = [];
  
  const userContext = user 
    ? `The story is written for ${user.name}, who is ${user.age} years old. Adjust the vocabulary and tone to be appropriate and engaging for this age.` 
    : "The tone should be magical, warm, and engaging.";

  promptParts.push({
    text: `You are a master novelist creating a cohesive picture book. 
    I will provide a sequence of ${images.length} images. 
    For each image, I may also provide a "Context Note".
    
    Your Task:
    1. Write a continuous, flowing story that links these images together.
    2. CRITICAL: Ensure smooth narrative transitions between pages. The end of page 1 must flow naturally into page 2. 
    3. If there are gaps in logic between images, invent creative narrative bridges to connect them.
    4. ${userContext}
    5. Do not merely describe the image visually (e.g., "In this image there is a cat"). Instead, weave it into the plot (e.g., "Suddenly, a small tabby cat emerged from the shadows...").
    
    Here is the sequence:`
  });

  for (let i = 0; i < images.length; i++) {
    const imgPart = await fileToGenerativePart(images[i].file);
    promptParts.push(imgPart);
    promptParts.push({ 
      text: `[Image ${i} Context]: ${images[i].note || "No specific note, fit this image into the ongoing story seamlessly."}` 
    });
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative title for the story book" },
      pages: {
        type: Type.ARRAY,
        description: "The story segments. Must be exactly one segment per image provided.",
        items: {
          type: Type.OBJECT,
          properties: {
            imageIndex: { type: Type.INTEGER, description: "The 0-based index of the image this text belongs to" },
            storySegment: { type: Type.STRING, description: "The narrative text for this page. Approx 2-3 sentences." }
          },
          required: ["imageIndex", "storySegment"]
        }
      }
    },
    required: ["title", "pages"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: promptParts
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: "You are an award-winning children's book author. Write compelling, connected stories.",
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as StoryResponse;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};