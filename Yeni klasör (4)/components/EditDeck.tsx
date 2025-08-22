

import React, { useState, useRef } from 'react';
import type { Deck, Product } from '../types.ts';
import { PlusIcon, TrashIcon } from './Icons.tsx';
import { CreateProduct } from './CreateProduct.tsx';

interface EditDeckProps {
  deck: Deck;
  allProducts: Product[];
  onSave: (updatedDeck: Deck) => void;
  onCreateProduct: (productData: Omit<Product, 'id' | 'creator'>) => Product;
}

export const EditDeck: React.FC<EditDeckProps> = ({ deck, allProducts, onSave, onCreateProduct }) => {
  const [name, setName] = useState(deck.name);
  const [media, setMedia] = useState<string[]>(deck.mediaUrls);
  const [productIds, setProductIds] = useState<string[]>(deck.productIds);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deckProducts = allProducts.filter(p => productIds.includes(p.id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveProduct = (productIdToRemove: string) => {
    setProductIds(prev => prev.filter(id => id !== productIdToRemove));
  };
  
  const handleSaveNewProduct = (newProductData: Omit<Product, 'id' | 'creator'>) => {
    const newProduct = onCreateProduct(newProductData);
    setProductIds(prev => [...prev, newProduct.id]);
    setIsCreatingProduct(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && media.length > 0) {
      onSave({
        ...deck,
        name,
        mediaUrls: media,
        productIds: productIds,
        productCount: productIds.length,
      });
    }
  };

  return (
    <>
      <div className="bg-black text-white h-screen overflow-y-auto pt-16 pb-24">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Edit Deck</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Deck Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Collection Images</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {media.map((imageSrc, index) => (
                      <div key={index} className="relative group aspect-square">
                          <img src={imageSrc} alt={`upload preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                          <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                          >
                              <TrashIcon className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <PlusIcon className="w-8 h-8" />
                    <span className="text-xs mt-1">Add</span>
                  </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h2 className="text-lg font-semibold mb-2">Products in this Deck</h2>
              <div className="space-y-2">
                  {deckProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded-lg">
                         <img src={product.variants[0]?.mediaUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                         <div className="flex-1">
                              <p className="font-semibold text-sm">{product.name}</p>
                              <p className="text-xs text-gray-400">${product.price.toFixed(2)}</p>
                         </div>
                         <button type="button" onClick={() => handleRemoveProduct(product.id)} aria-label="Remove product">
                             <TrashIcon className="w-5 h-5 text-red-500" />
                         </button>
                      </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCreatingProduct(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300"
                  >
                      <PlusIcon className="w-5 h-5" /> Add Product
                  </button>
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10 max-w-md mx-auto">
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!name.trim() || media.length === 0}>
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
      {isCreatingProduct && <CreateProduct onSave={handleSaveNewProduct} onClose={() => setIsCreatingProduct(false)} />}
    </>
  );
};