import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GenerateContentResponseChunk } from '../types';

/**
 * Streams chat responses from the Gemini API, providing full conversation context.
 * @param conversationMessages The entire array of messages in the current conversation.
 * @returns An async iterator for streaming content chunks, including token usage metadata.
 */
export async function* streamChatResponse(conversationMessages: ChatMessage[]): AsyncGenerator<GenerateContentResponseChunk> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Map ChatMessage[] to GoogleGenAI's ContentPart[] format for conversation context
  const contents = conversationMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview', // Using a flash model for responsiveness
      contents: contents, // Pass the entire conversation history as context
      config: {
        temperature: 0.6,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 800,
      }
    });

    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      yield {
        text: c.text,
        candidates: c.candidates, // Pass candidates if needed
        usageMetadata: c.usageMetadata, // Pass usage metadata directly with the chunk
      };
    }

  } catch (error) {
    console.error("Error streaming from Gemini API:", error);
    yield {
      text: "Sorry, I encountered an error. Please try again.",
    };
  }
}