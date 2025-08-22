
import React, { useState, useEffect, useRef } from 'react';
import type { User, Deck } from '../types.ts';
import { EllipsisVerticalIcon, LinkIcon, FilmIcon } from './Icons.tsx';

interface ProfileProps {
  user: User;
  onEditProfile: () => void;
  onCreateDeck: () => void;
  onNavigateToDeck: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onShareProfile: (userId: string) => void;
  onShareDeck: (deckId: string) => void;
  onGenerateVideoForDeck: (deck: Deck) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onEditProfile, onCreateDeck, onNavigateToDeck, onEditDeck, onDeleteDeck, onShareProfile, onShareDeck, onGenerateVideoForDeck }) => {
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuDeckId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-full border-2 border-gray-700" />
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-gray-400">{user.contact.email}</p>
          </div>
        </div>
        <p className="text-gray-300">{user.bio}</p>
        <div className="space-y-2">
            <div className="flex gap-2">
                <button onClick={onEditProfile} className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                    Profili Düzenle
                </button>
                <button onClick={onCreateDeck} className="flex-1 bg-gray-800 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                    Yeni Deck Oluştur
                </button>
            </div>
            <button 
                onClick={() => onShareProfile(user.id)}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <LinkIcon className="w-5 h-5"/>
                Profili Paylaş
            </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h2 className="px-4 text-xl font-semibold mb-2">My Decks</h2>
        <div className="grid grid-cols-2 gap-px bg-gray-800">
          {user.decks.map(deck => (
            <div key={deck.id} className="relative bg-black aspect-square group">
              <button onClick={() => onNavigateToDeck(deck)} className="w-full h-full focus:outline-none">
                <img src={deck.mediaUrls[0]} alt={deck.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-50 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-2">
                  <h3 className="font-bold">{deck.name}</h3>
                  <p className="text-xs text-gray-300">{deck.productCount} products</p>
                </div>
              </button>
              <div className="absolute top-1 right-1">
                <button onClick={() => setOpenMenuDeckId(openMenuDeckId === deck.id ? null : deck.id)} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {openMenuDeckId === deck.id && (
                  <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 animate-fadeIn">
                    <button
                      onClick={() => { onGenerateVideoForDeck(deck); setOpenMenuDeckId(null); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      <FilmIcon className="w-4 h-4" />
                      Tanıtım Videosu Oluştur
                    </button>
                    <button
                      onClick={() => { onEditDeck(deck); setOpenMenuDeckId(null); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Düzenle
                    </button>
                     <button
                      onClick={() => { onShareDeck(deck.id); setOpenMenuDeckId(null); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Paylaş
                    </button>
                    <button
                      onClick={() => { onDeleteDeck(deck.id); setOpenMenuDeckId(null); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      Sil
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { 
            animation: fadeIn 0.1s ease-out forwards; 
            transform-origin: top right;
        }
      `}</style>
    </div>
  );
};