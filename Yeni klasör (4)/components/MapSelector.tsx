
import React from 'react';
import { MapPinIcon, CloseIcon } from './Icons.tsx';

interface MapSelectorProps {
  onClose: () => void;
  onLocationSelect: (address: { street: string; city: string; country: string }) => void;
}

export const MapSelector: React.FC<MapSelectorProps> = ({ onClose, onLocationSelect }) => {
  
  // Mock address that would be derived from reverse geocoding in a real app
  const MOCK_ADDRESS = {
    street: '1600 Amphitheatre Pkwy',
    city: 'Mountain View',
    country: 'USA'
  };

  const handleConfirm = () => {
    onLocationSelect(MOCK_ADDRESS);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full h-full max-w-md mx-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
          <h2 className="text-xl font-bold">Select Location</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow relative bg-gray-700 overflow-hidden">
          {/* Mock Map Background */}
          <img 
            src="https://source.unsplash.com/random/800x1200/?map" 
            alt="Map" 
            className="w-full h-full object-cover opacity-50"
          />
          {/* Center Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500">
            <MapPinIcon className="w-12 h-12" style={{ transform: 'translateY(-50%)' }}/>
          </div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-red-700 rounded-full"></div>
        </div>

        <footer className="p-4 bg-[#121212] flex-shrink-0 space-y-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="font-semibold">{MOCK_ADDRESS.street}</p>
            <p className="text-sm text-gray-400">{`${MOCK_ADDRESS.city}, ${MOCK_ADDRESS.country}`}</p>
          </div>
          <button 
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Location
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};