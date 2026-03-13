import React from 'react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void; // New prop for delete functionality
  currentConversationId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  onNewChat,
  onLoadConversation,
  onDeleteConversation, // Destructure new prop
  currentConversationId
}) => {
  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // Prevent the parent button from triggering onLoadConversation
    e.preventDefault(); // Prevent default button behavior, if any

    if (window.confirm(`Are you sure you want to delete the conversation "${title || "Untitled Chat"}"?`)) {
      onDeleteConversation(id);
    }
  };

  return (
    <div className="w-72 bg-gray-800 text-white flex flex-col p-4 shadow-2xl z-10">
      <button
        onClick={onNewChat}
        className="mb-6 w-full py-3 px-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        aria-label="Start a new chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <h2 className="text-xl font-bold mb-4 text-gray-200">History</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No conversations yet.</p>
        ) : (
          <ul role="list" aria-label="Conversation history">
            {conversations.map((conv) => (
                <li key={conv.id} className="mb-2 group"> {/* Add group for hover effects */}
                  <div
                    className={`flex items-center justify-between w-full py-2 px-3 rounded-lg transition-all duration-200 ease-in-out
                      ${currentConversationId === conv.id
                        ? 'bg-blue-700 text-white font-semibold shadow-inner'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      } focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-75`}
                  >
                    <button
                      onClick={() => onLoadConversation(conv.id)}
                      className="flex-grow text-left focus:outline-none" // Make this the primary clickable area
                      aria-current={currentConversationId === conv.id ? 'page' : undefined}
                      title={conv.title || "Untitled Chat"}
                    >
                      <span className="block text-base truncate">{conv.title || "Untitled Chat"}</span>
                      <span className="text-xs text-gray-400 block mt-1">
                        {new Date(conv.lastUpdated).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, conv.id, conv.title)}
                      className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-300 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      aria-label={`Delete conversation: ${conv.title || "Untitled Chat"}`}
                      title={`Delete ${conv.title || "Untitled Chat"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm7 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);