
import React, { useState } from 'react';
import type { ChatMessage, Product, User } from '../types.ts';

interface ChatViewProps {
  currentUser: User;
  otherUser: User;
  initialMessages: ChatMessage[];
  productContext?: Product;
  prefilledMessage?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, otherUser, initialMessages, productContext, prefilledMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState(prefilledMessage || '');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: `msg${messages.length + 1}`,
      text: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      <header className="p-4 flex items-center gap-3 bg-[#121212] border-b border-gray-800">
        <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-10 h-10 rounded-full" />
        <div>
          <h1 className="font-semibold">{otherUser.username}</h1>
          <p className="text-xs text-green-400">Online</p>
        </div>
      </header>

      {productContext && (
        <div className="p-2 bg-[#121212] border-b border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg">
            <img src={productContext.variants[0].mediaUrl} alt={productContext.name} className="w-12 h-12 object-cover rounded-md" />
            <div>
              <p className="font-semibold text-sm">{productContext.name}</p>
              <p className="text-xs text-gray-400">${productContext.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            {msg.senderId !== currentUser.id && (
              <img src={otherUser.avatarUrl} className="w-6 h-6 rounded-full self-end" alt="sender"/>
            )}
            <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-blue-600 rounded-br-none' : 'bg-[#262626] rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 opacity-60 ${msg.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="p-2 border-t border-gray-800 bg-black">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#262626] border border-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 rounded-full p-2 hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};