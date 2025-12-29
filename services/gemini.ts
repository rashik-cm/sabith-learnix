
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async *streamText(prompt: string, history: { role: string; content: string }[]) {
    const chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "Your name is Learnix. You are a highly intelligent real-time assistant created by Muhammed Sabith KP. Be helpful, concise, and friendly. Use markdown for clarity when needed.",
      }
    });

    const responseStream = await chat.sendMessageStream({ message: prompt });
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  }

  connectLive(callbacks: any) {
    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'Your name is Learnix. You are a friendly real-time voice assistant created by Muhammed Sabith KP. Keep responses brief, natural, and conversational.',
      },
    });
  }
}

export const geminiService = new GeminiService();
