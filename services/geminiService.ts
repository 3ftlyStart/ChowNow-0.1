import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { MENU_ITEMS, DELIVERY_FEE } from '../constants';
import { MenuItem } from '../types';

// Initialize the API client
const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '';
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const postToInstagramTool: FunctionDeclaration = {
  name: 'postToInstagram',
  description: 'Post a new image to the restaurant\'s Instagram feed. Use this tool when the user explicitly asks to "post to instagram" or "add a photo to the feed".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      caption: { 
        type: Type.STRING, 
        description: 'A catchy, fun caption for the Instagram post, including emojis.' 
      },
      topic: { 
        type: Type.STRING, 
        description: 'The main food subject of the photo (e.g., "burger", "pizza", "drink", "dessert") to help generate the image.' 
      }
    },
    required: ['caption', 'topic']
  }
};

const SYSTEM_PROMPT = `
You are Nono, the friendly, energetic, and slightly goofy mascot AI for "Chow~Sho!", a fast food restaurant at 7742 Victoria Range, Masvingo.
You are not just a menu bot; you are a food enthusiast who loves to chat!

Here is our menu data:
${JSON.stringify(MENU_ITEMS.map(i => ({ 
  name: i.name, 
  price: i.price, 
  category: i.category, 
  desc: i.description,
  available: i.available 
})))}

Operational Info:
- Delivery Fee: $${DELIVERY_FEE.toFixed(2)} on all orders.
- Instagram Handle: @ChowShoYummy

Your Personality:
- **Energetic & Friendly:** Always sound excited. Use emojis like 🍔, 🍕, ✨, 😋.
- **Playful & Punny:** Throw in a food pun or a cheesy joke when appropriate.
- **Complimentary:** If a user talks about specific food, tell them they have "legendary taste".
- **Social Media Savvy:** You manage the restaurant's Instagram. If a user asks you to post something, use the 'postToInstagram' tool!

Capabilities & Rules:
1. **Budget Master:** If a user mentions a budget, calculate a combo including the $${DELIVERY_FEE.toFixed(2)} fee.
2. **Flavor Detective:** Suggest items based on flavor profiles (spicy, sweet, etc.).
3. **Instagram Poster:** If the user says "Post a burger to insta" or "Add a pic to the feed", CALL the 'postToInstagram' function. Do not just say you did it; actually use the tool.
4. **Delivery:** For delivery, point them to the "Checkout" button.
5. **Concise:** Keep text responses short (under 60 words).
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [postToInstagramTool] }],
      },
    });
  }
  return chatSession;
};

export const sendMessageToNono = async (
  message: string, 
  onPostToInstagram?: (caption: string, topic: string) => void
): Promise<string> => {
  try {
    const session = getChatSession();
    let response = await session.sendMessage({ message });

    // Handle Function Calls
    while (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === 'postToInstagram' && onPostToInstagram) {
        const { caption, topic } = call.args as any;
        
        // Execute the action on the frontend
        onPostToInstagram(caption, topic);
        
        // Send the result back to the model
        response = await session.sendMessage({
          message: [{
            functionResponse: {
              name: 'postToInstagram',
              response: { result: 'success' } 
            }
          }]
        });
      } else {
        // Break if unknown function or no handler (shouldn't happen with correct config)
        break;
      }
    }

    return response.text || "I'm munching on some data... try again in a sec! 🍔";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Oops! My brain froze like a milkshake. 🍦 Try asking again!";
  }
};

export const generateMenuItemImage = async (item: MenuItem): Promise<string | null> => {
  try {
    const prompt = `Professional food photography of ${item.name}, described as: ${item.description}. Close up, studio lighting, 4k high resolution, appetizing, delicious, vibrant colors, shallow depth of field, isolated on a clean subtle background.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};