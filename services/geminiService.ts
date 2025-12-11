import { GoogleGenAI, Type } from "@google/genai";
import { KafkaMessage } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to determine model based on complexity, adhering to guidelines
const MODEL_FAST = 'gemini-2.5-flash';

export const generateSyntheticData = async (topicName: string, count: number = 1): Promise<any[]> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock data.");
    return [{ error: "AI generation requires API Key" }];
  }

  try {
    const prompt = `Generate ${count} realistic JSON sample message(s) for a Kafka topic named "${topicName}". 
    The data should correspond to what you would expect in a real-world enterprise system for this topic name.
    Return ONLY a JSON array of objects.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    data: { type: Type.OBJECT, description: "The payload content"}
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return [{ error: "Failed to generate data" }];
  }
};

export const analyzeMessagePayload = async (message: KafkaMessage): Promise<string> => {
    if (!apiKey) return "AI Analysis requires a configured API Key.";

    try {
        const prompt = `Analyze this Kafka message payload. Explain what business event it likely represents, identify any potential anomalies (like missing common fields or strange values), and suggest a TypeScript interface for it.
        
        Topic Partition: ${message.partition}
        Payload: ${JSON.stringify(message.value, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
        });

        return response.text || "No analysis available.";
    } catch (e) {
        console.error(e);
        return "Error analyzing message.";
    }
};
