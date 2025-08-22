
import React, { useState, useRef, useMemo } from 'react';
import type { Product, MediaVariant } from '../types.ts';
import { PlusIcon, TrashIcon, CloseIcon, PhotographIcon } from './Icons.tsx';
import { AISceneStudio } from './AISceneStudio.tsx';

interface CreateProductProps {
  onSave: (product: Omit<Product, 'id' | 'creator'>) => void;
  onClose: () => void;
}

// A simplified version for the form state
type DraftVariant = Omit<MediaVariant, 'mediaType'> & { file?: File };

export const CreateProduct: React.FC<CreateProductProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [variants, setVariants] = useState<DraftVariant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);

  const [isAISceneStudioOpen, setIsAISceneStudioOpen] = useState(false);
  const [editingVariantIndexForAI, setEditingVariantIndexForAI] = useState<number | null>(null);


  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Product name is required.");
    if (!price.trim() || isNaN(parseFloat(price))) errors.push("A valid price is required.");
    if (variants.length === 0) {
      errors.push("Please add at least one product variant.");
    } else {
      variants.forEach((v, i) => {
        if (!v.name.trim()) errors.push(`Variant #${i + 1} needs a name.`);
        if (!v.mediaUrl) errors.push(`Variant #${i + 1} needs an image or video.`);
      });
    }
    return errors;
  }, [name, price, variants]);

  const isFormValid = validationErrors.length === 0;

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', color: '#000000', mediaUrl: '' }]);
  };

  const handleVariantChange = (index: number, field: keyof DraftVariant, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && activeVariantIndex !== null) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              handleVariantChange(activeVariantIndex, 'mediaUrl', reader.result as string);
              handleVariantChange(activeVariantIndex, 'file', file);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUploadClick = (index: number) => {
      setActiveVariantIndex(index);
      fileInputRef.current?.click();
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddSize = () => {
    const trimmedSize = currentSize.trim();
    if (trimmedSize && !sizes.includes(trimmedSize)) {
      setSizes([...sizes, trimmedSize]);
      setCurrentSize('');
    }
  };

  const handleRemoveSize = (indexToRemove: number) => {
    setSizes(sizes.filter((_, index) => index !== indexToRemove));
  };

  const handleSizeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  const handleAIImageGenerated = (imageUrl: string) => {
    if (editingVariantIndexForAI !== null) {
        handleVariantChange(editingVariantIndexForAI, 'mediaUrl', imageUrl);
        handleVariantChange(editingVariantIndexForAI, 'file', undefined); // It's a URL, not a local file
    }
    setIsAISceneStudioOpen(false);
    setEditingVariantIndexForAI(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        alert(`Please fix the following issues:\n- ${validationErrors.join('\n- ')}`);
        return;
    }

    const finalVariants: MediaVariant[] = variants.map(v => ({
      name: v.name,
      color: v.color,
      mediaUrl: v.mediaUrl,
      mediaType: v.file?.type.startsWith('video') ? 'video' : 'image',
    }));

    const newProduct: Omit<Product, 'id' | 'creator'> = {
      name,
      price: parseFloat(price),
      description,
      fabric: { // Default fabric details
        name: "Not specified",
        description: "A high-quality fabric whose details were not specified.",
        closeUpImageUrl: "https://picsum.photos/seed/fabric-default/800",
        movementVideoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      },
      variants: finalVariants,
      sizes: sizes,
    };

    onSave(newProduct);
  };
  
  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col animate-fadeIn">
      <div className="w-full h-full max-w-md mx-auto flex flex-col bg-black">
         <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
          <h2 className="text-xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Basic Info */}
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                    <input type="text" id="productName" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
                </div>
                 <div>
                    <label htmlFor="sizes-input" className="block text-sm font-medium text-gray-400 mb-1">Sizes</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[44px] bg-gray-900 rounded-lg border border-gray-800">
                      {sizes.map((size, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-gray-700 text-white text-sm font-medium rounded-full px-3 py-1 animate-fadeIn">
                          <span>{size}</span>
                          <button type="button" onClick={() => handleRemoveSize(index)} className="text-gray-400 hover:text-white" aria-label={`Remove ${size} size`}>
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="sizes-input"
                            value={currentSize}
                            placeholder="Type size and press Enter"
                            onChange={e => setCurrentSize(e.target.value)}
                            onKeyDown={handleSizeInputKeyDown}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddSize} 
                            className="bg-gray-700 text-white font-semibold px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!currentSize.trim()}
                        >
                            Add
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add available product sizes, like "S", "M", "42", etc.</p>
                </div>

                {/* Variants */}
                <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Variants</h3>
                    <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={index} className="p-3 bg-gray-900 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">Variant {index + 1}</p>
                                    <button type="button" onClick={() => removeVariant(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => handleUploadClick(index)} className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {variant.mediaUrl ? <img src={variant.mediaUrl} className="w-full h-full object-cover"/> : <PlusIcon className="w-6 h-6 text-gray-500"/>}
                                    </button>
                                    <div className="flex-1 space-y-2">
                                        <input type="text" placeholder="Variant Name (e.g. Red)" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" required/>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`color-${index}`} className="text-sm">Color:</label>
                                            <input type="color" id={`color-${index}`} value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} className="w-8 h-8 p-0 border-none rounded bg-gray-800" />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setEditingVariantIndexForAI(index);
                                                    setIsAISceneStudioOpen(true);
                                                }}
                                                className="ml-auto p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/40"
                                                title="Generate with AI"
                                            >
                                                <PhotographIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddVariant} className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300">
                        <PlusIcon className="w-5 h-5"/> Add Variant
                    </button>
                </div>
            </div>
            
            <footer className="p-4 bg-[#121212] flex-shrink-0">
              <button 
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Add Product to Deck
              </button>
              {!isFormValid && validationErrors.length > 0 && (
                <p className="text-xs text-red-400 text-center mt-2">
                  {validationErrors[0]}
                </p>
              )}
            </footer>
        </form>
      </div>
    </div>
     {isAISceneStudioOpen && (
        <AISceneStudio
            onSave={handleAIImageGenerated}
            onClose={() => {
                setIsAISceneStudioOpen(false);
                setEditingVariantIndexForAI(null);
            }}
        />
    )}
    <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
      `}</style>
    </>
  );
};