import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import TypingAnimation from './TypingAnimation';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false); // State for copy feedback

  const messageClasses = isUser
    ? 'bg-blue-500 text-white self-end rounded-bl-xl'
    : 'bg-gray-200 text-gray-800 self-start rounded-br-xl';

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset 'copied' state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally provide user feedback for copy failure
    }
  };

  const content = message.isStreaming ? (
    <TypingAnimation text={message.text} />
  ) : (
    message.text
  );

  const copyButtonClasses = copied
    ? 'bg-green-500 text-white' // Feedback state
    : isUser
      ? 'text-blue-100 hover:bg-blue-400 hover:text-white' // User message colors
      : 'text-gray-500 hover:bg-gray-300 hover:text-gray-700'; // AI message colors

  return (
    <div className={`p-3 max-w-[80%] rounded-t-xl my-1 shadow group ${messageClasses}`}>
      {/* Message Content */}
      {content}

      {/* Footer for timestamp, tokens, and copy button */}
      <div className={`flex items-center gap-2 mt-1 text-xs ${isUser ? 'text-gray-200' : 'text-gray-500'}`}>
        {/* Timestamp - always visible, takes available space */}
        <span className="flex-grow">{message.timestamp}</span>

        {/* Token Usage - conditionally visible */}
        {!message.isStreaming && message.tokenUsage && (
          <span className="opacity-75">
            {isUser ? (
              // For user messages, display only promptTokens
              <span>Tokens: {message.tokenUsage.promptTokens || 0}</span>
            ) : (
              // For AI messages, display totalTokens or breakdown
              message.tokenUsage.totalTokens !== undefined ? (
                <span>Tokens: {message.tokenUsage.totalTokens}</span>
              ) : (
                <span>
                  Prompt: {message.tokenUsage.promptTokens || 0}, Completion: {message.tokenUsage.completionTokens || 0}
                </span>
              )
            )}
          </span>
        )}

        {/* Copy Button - conditionally visible and on hover */}
        {!message.isStreaming && ( // Only show copy button if message is not streaming
          <button
            onClick={handleCopyClick}
            className={`p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ${copyButtonClasses}`}
            aria-label={copied ? "Copied!" : "Copy message to clipboard"}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              // Checkmark icon when copied
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              // Copy icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;