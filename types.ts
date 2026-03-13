export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isStreaming?: boolean; // True if the AI message is currently being streamed
  tokenUsage?: TokenUsage; // Added: Optional token usage information
  timestamp: string; // New: Timestamp for the message
}

export interface GeminiContentPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

// Minimal type for the chunk returned by the streaming API
export interface GenerateContentResponseChunk {
  text: string | undefined;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          data?: string; // 'data' can be optional in streaming chunks from the API
          // FIX: mimeType should be optional to match the library's Blob_2 type
          mimeType?: string;
        };
      }>;
    };
  }>;
  // Added: Optional usageMetadata to carry token info from service to app, especially in a final metadata-only chunk
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface Conversation {
  id: string;
  title: string; // e.g., first user message, or AI-generated summary
  messages: ChatMessage[];
  lastUpdated: string; // ISO string for sorting
}