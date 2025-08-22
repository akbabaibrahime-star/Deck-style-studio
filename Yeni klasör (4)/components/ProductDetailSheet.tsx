
import React from 'react';
import type { Product } from '../types.ts';
import { CloseIcon } from './Icons.tsx';

interface ProductDetailSheetProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({ product, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn" 
        onClick={onClose}
    >
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#121212] text-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-serif">Product Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-2xl mb-2 font-serif">{product.name}</h3>
            <p className="text-gray-300">{product.description}</p>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-400 uppercase text-sm mb-3">Feel the Fabric</h3>
            <div className="space-y-4">
                <h4 className="font-bold text-lg">{product.fabric.name}</h4>
                <p className="text-gray-300 text-sm">{product.fabric.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Texture</p>
                        <img src={product.fabric.closeUpImageUrl} alt={`${product.fabric.name} closeup`} className="w-full h-auto object-cover rounded-lg aspect-square"/>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Movement</p>
                        <video src={product.fabric.movementVideoUrl} autoPlay loop muted playsInline className="w-full h-auto object-cover rounded-lg aspect-square bg-gray-900"/>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};