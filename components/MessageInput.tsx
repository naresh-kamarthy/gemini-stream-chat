import React from 'react';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent) => void;
  isDisabled: boolean; // Retained for general disabling (e.g., when AI is typing)
  promptTokenCount?: number | null; // Retained
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend, isDisabled, promptTokenCount }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      if (value.trim() && !isDisabled) { // Only send if not disabled
        onSend(e);
      }
    }
  };

  return (
    <form onSubmit={onSend} className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sticky bottom-0">
      {/* Container for textarea and button, aligned at the bottom */}
      <div className="flex items-end w-full">
        <textarea
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={isDisabled ? "AI is typing..." : "Type your message..."} // Simplified placeholder
          disabled={isDisabled}
        />
        {/* Always show Send button */}
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isDisabled || !value.trim()} // Disable if overall input is disabled or no text
        >
          Send
        </button>
      </div>
      {/* Prompt token count moved below the input row */}
      {promptTokenCount !== null && ( // Always show if not null (will be 0 for empty)
        <span className="text-xs text-gray-500 mt-1 self-end">
          Prompt Tokens: {promptTokenCount}
        </span>
      )}
    </form>
  );
};

export default MessageInput;