
import React from 'react';
import type { User, Product, Deck } from '../types.ts';
import { ChatBubbleIcon, PhoneIcon, MailIcon, MapPinIcon } from './Icons.tsx';

interface CreatorProfileProps {
  creator: User;
  onNavigateToChat: (creator: User, product?: Product) => void;
  onNavigateToDeck: (deck: Deck) => void;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({ creator, onNavigateToChat, onNavigateToDeck }) => {
    const { street, city, country } = creator.address;
    const fullAddress = `${street}, ${city}, ${country}`;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-8">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <img src={creator.avatarUrl} alt={creator.username} className="w-24 h-24 rounded-full border-2 border-gray-700" />
          <div>
            <h1 className="text-2xl font-bold">{creator.username}</h1>
            <p className="text-gray-400">{creator.contact.email}</p>
          </div>
        </div>
        <p className="text-gray-300">{creator.bio}</p>
        <button 
          onClick={() => onNavigateToChat(creator)}
          className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <ChatBubbleIcon className="w-5 h-5" />
          <span>Mesaj Gönder</span>
        </button>

        {/* Contact Info Section */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
            <h2 className="text-xl font-semibold">İletişim Bilgileri</h2>
            <div className="space-y-2">
                 <a href={`tel:${creator.contact.phone}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <PhoneIcon className="w-5 h-5 text-gray-400"/>
                    <span>{creator.contact.phone}</span>
                </a>
                 <a href={`mailto:${creator.contact.email}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <MailIcon className="w-5 h-5 text-gray-400"/>
                    <span>{creator.contact.email}</span>
                </a>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <MapPinIcon className="w-5 h-5 text-gray-400"/>
                    <span>{fullAddress}</span>
                </a>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h2 className="px-4 text-xl font-semibold mb-2">Decks</h2>
        <div className="grid grid-cols-2 gap-px bg-gray-800">
          {creator.decks.map(deck => (
            <button key={deck.id} onClick={() => onNavigateToDeck(deck)} className="relative bg-black aspect-square group focus:outline-none">
              <img src={deck.mediaUrls[0]} alt={deck.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-50 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-2">
                <h3 className="font-bold">{deck.name}</h3>
                <p className="text-xs text-gray-300">{deck.productCount} products</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};