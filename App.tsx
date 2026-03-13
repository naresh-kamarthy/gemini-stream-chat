import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import { streamChatResponse } from './services/geminiService';
import { ChatMessage, TokenUsage, Conversation } from './types';
import { GoogleGenAI } from "@google/genai";

// Constants for local storage keys
const LOCAL_STORAGE_HISTORY_KEY = 'geminiChatHistory';
const LOCAL_STORAGE_CURRENT_CONVERSATION_ID_KEY = 'geminiCurrentConversationId';

// Helper component for loading indicator
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Helper function to get a formatted timestamp
const getFormattedTimestamp = () => {
  return new Date().toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h24'
  });
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [promptTokenCount, setPromptTokenCount] = useState<number | null>(null);
  const lastAiMessageId = useRef<string | null>(null);

  // Effect to load conversations from local storage on initial mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (savedHistory) {
      const parsedHistory: Conversation[] = JSON.parse(savedHistory);
      setConversationHistory(parsedHistory);

      const savedCurrentId = localStorage.getItem(LOCAL_STORAGE_CURRENT_CONVERSATION_ID_KEY);
      let activeConversation = null;

      if (savedCurrentId) {
        activeConversation = parsedHistory.find(conv => conv.id === savedCurrentId);
      }
      
      if (!activeConversation && parsedHistory.length > 0) {
        activeConversation = parsedHistory.sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0];
      }

      if (activeConversation) {
        setMessages(activeConversation.messages);
        setCurrentConversationId(activeConversation.id);
      }
    }
  }, []);

  // Effect to save conversations to local storage whenever history changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(conversationHistory));
    if (currentConversationId) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_CONVERSATION_ID_KEY, currentConversationId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_CONVERSATION_ID_KEY);
    }
  }, [conversationHistory, currentConversationId]);

  // Effect to calculate prompt tokens in real-time
  useEffect(() => {
    const calculateTokens = async () => {
      if (input.trim()) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const { totalTokens } = await ai.models.countTokens({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: input }] },
          });
          setPromptTokenCount(totalTokens);
        } catch (error) {
          console.error("Error counting tokens:", error);
          setPromptTokenCount(0);
        }
      } else {
        setPromptTokenCount(0);
      }
    };

    const handler = setTimeout(() => {
      calculateTokens();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [input]);

  // Function to update or add a conversation to history
  const updateConversationInHistory = useCallback((convId: string, updatedMessages: ChatMessage[]) => {
    setConversationHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex((conv) => conv.id === convId);
      if (existingIndex > -1) {
        const updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          messages: updatedMessages,
          lastUpdated: new Date().toISOString(),
        };
        // Update title if it was "New Chat" and now has a first user message
        if (updatedHistory[existingIndex].title === "New Chat" && updatedMessages.length > 0 && updatedMessages[0].sender === 'user') {
          updatedHistory[existingIndex].title = updatedMessages[0]?.text.substring(0, 50) + (updatedMessages[0]?.text.length > 50 ? '...' : '');
        }
        return updatedHistory;
      } else {
        const newConversation: Conversation = {
          id: convId,
          title: updatedMessages[0]?.text.substring(0, 50) + (updatedMessages[0]?.text.length > 50 ? '...' : '') || "New Chat",
          messages: updatedMessages,
          lastUpdated: new Date().toISOString(),
        };
        return [...prevHistory, newConversation];
      }
    });
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const currentUserPromptTokens = promptTokenCount;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: getFormattedTimestamp(),
      tokenUsage: currentUserPromptTokens !== null ? { promptTokens: currentUserPromptTokens } : undefined,
    };

    const updatedMessagesForDisplay = [...messages, userMessage];
    setMessages(updatedMessagesForDisplay);

    let activeConvId = currentConversationId;
    if (!activeConvId) {
      activeConvId = uuidv4();
      setCurrentConversationId(activeConvId);
      setConversationHistory((prevHistory) => {
        const newConversation: Conversation = {
          id: activeConvId!,
          title: userMessage.text.substring(0, 50) + (userMessage.text.length > 50 ? '...' : ''),
          messages: [userMessage],
          lastUpdated: new Date().toISOString(),
        };
        return [...prevHistory, newConversation];
      });
    } else {
      updateConversationInHistory(activeConvId, updatedMessagesForDisplay);
    }

    setInput('');
    setPromptTokenCount(0);
    setIsSending(true);

    const aiResponseId = uuidv4();
    lastAiMessageId.current = aiResponseId;
    
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: aiResponseId,
        text: '',
        sender: 'ai',
        isStreaming: true,
        timestamp: getFormattedTimestamp(),
      },
    ]);

    try {
      const stream = await streamChatResponse(updatedMessagesForDisplay);
      let accumulatedText = '';
      let finalTokenUsage: TokenUsage | undefined = undefined;

      for await (const chunk of stream) {
        if (chunk.text !== undefined) {
          accumulatedText += chunk.text;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === aiResponseId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }

        if (chunk.usageMetadata) {
          finalTokenUsage = {
            promptTokens: chunk.usageMetadata.promptTokenCount,
            completionTokens: chunk.usageMetadata.candidatesTokenCount,
            totalTokens: chunk.usageMetadata.totalTokenCount,
          };
        }
        setIsSending(false);
      }

      setMessages((prevMessages) => {
        const finalMessages = prevMessages.map((msg) => {
          if (msg.id === aiResponseId) {
            return { ...msg, text: accumulatedText, isStreaming: false, tokenUsage: finalTokenUsage };
          }
          return msg;
        });
        updateConversationInHistory(activeConvId!, finalMessages);
        return finalMessages;
      });

    } catch (error: any) {
      console.error("Error processing AI response:", error);
      setMessages((prevMessages) => {
        const errorMessages = prevMessages.map((msg) =>
          msg.id === aiResponseId
            ? { ...msg, text: 'Error generating response.', isStreaming: false }
            : msg
        );
        updateConversationInHistory(activeConvId!, errorMessages);
        return errorMessages;
      });
    } finally {
      setIsSending(false);
      lastAiMessageId.current = null;
    }
  }, [input, isSending, messages, currentConversationId, promptTokenCount, updateConversationInHistory]);

  const startNewConversation = useCallback(() => {
    if (messages.length > 0 && !currentConversationId) {
        const newConversationId = uuidv4();
        setConversationHistory(prevHistory => [...prevHistory, {
            id: newConversationId,
            title: messages[0]?.text.substring(0, 50) + (messages[0]?.text.length > 50 ? '...' : '') || "New Chat",
            messages: messages,
            lastUpdated: new Date().toISOString(),
        }]);
    } else if (currentConversationId && messages.length === 0) {
        // If an old conversation was loaded but then all messages deleted, this ensures it's removed or handled.
    }
    
    setMessages([]);
    setCurrentConversationId(null);
  }, [messages, currentConversationId]);


  const loadConversation = useCallback((id: string) => {
    const conversationToLoad = conversationHistory.find((conv) => conv.id === id);
    if (conversationToLoad) {
      setMessages(conversationToLoad.messages);
      setCurrentConversationId(conversationToLoad.id);
    }
  }, [conversationHistory]);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversationHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter(conv => conv.id !== id);

      if (currentConversationId === id) {
        // If the deleted conversation was the active one, clear current messages and ID
        setMessages([]);
        setCurrentConversationId(null);

        // Try to load the most recent remaining conversation if any
        if (updatedHistory.length > 0) {
          const mostRecent = updatedHistory.sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0];
          setMessages(mostRecent.messages);
          setCurrentConversationId(mostRecent.id);
        }
      }
      return updatedHistory;
    });
  }, [currentConversationId]);

  // Determine if the AI is currently typing (streaming) for input disabling
  const isAiTyping = messages.some(
    (msg) => msg.id === lastAiMessageId.current && msg.isStreaming
  );

  // Disable input if sending or AI is typing
  const disableInput = isSending || isAiTyping;

  // Memoized sorted list of conversations for the Sidebar
  const sortedConversationHistory = useMemo(() => {
    return [...conversationHistory].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [conversationHistory]);

  return (
    <div className="flex w-full h-full">
      <Sidebar
        conversations={sortedConversationHistory}
        onNewChat={startNewConversation}
        onLoadConversation={loadConversation}
        onDeleteConversation={handleDeleteConversation} // Pass delete handler
        currentConversationId={currentConversationId}
      />
      <div className="flex flex-col flex-1 bg-white shadow-lg rounded-r-lg">
        <header className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-tr-lg">
          <h1 className="text-2xl font-bold text-center">Gemini Stream Chat</h1>
        </header>
        <ChatWindow messages={messages} />
        {isSending && <LoadingIndicator />}
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSend={handleSendMessage}
          isDisabled={disableInput}
          promptTokenCount={promptTokenCount}
        />
      </div>
    </div>
  );
}

export default App;