


import React from 'react';
import type { CartItem, Product, User } from '../types.ts';
import { PlusIcon, MinusIcon, TrashIcon, ShareIcon, ChatBubbleIcon } from './Icons.tsx';

interface BasketViewProps {
  cart: CartItem[];
  products: Product[];
  updateCartItemQuantity: (productId: string, variantName: string, newQuantity: number) => void;
  onNavigateToChat?: (creator: User, product?: Product, message?: string) => void;
  onNavigateToProduct?: (productId: string, variantName: string) => void;
}

export const BasketView: React.FC<BasketViewProps> = ({ cart, products, updateCartItemQuantity, onNavigateToChat, onNavigateToProduct }) => {
  const getProductDetails = (productId: string) => products.find(p => p.id === productId);

  const groupedByCreator: { [key: string]: CartItem[] } = cart.reduce((acc, item) => {
    const product = getProductDetails(item.productId);
    if (product) {
      const creatorId = product.creator.id;
      if (!acc[creatorId]) {
        acc[creatorId] = [];
      }
      acc[creatorId].push(item);
    }
    return acc;
  }, {} as { [key: string]: CartItem[] });

  const creators = Object.keys(groupedByCreator).map(creatorId => getProductDetails(groupedByCreator[creatorId][0].productId)?.creator).filter(Boolean) as User[];

  const grandTotal = cart.reduce((total, item) => {
    const product = getProductDetails(item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleShareCart = async () => {
    let shareText = "My basket from Deck:\n\n";
    creators.forEach(creator => {
        shareText += `From ${creator.username}:\n`;
        groupedByCreator[creator.id].forEach(item => {
            const product = getProductDetails(item.productId);
            if(product) {
                shareText += `- ${product.name} (${item.variantName}${item.size ? `, ${item.size}` : ''}) x${item.quantity}\n`;
            }
        });
        shareText += "\n";
    });
    shareText += `Total: $${grandTotal.toFixed(2)}`;
    
    const shareData = {
        title: 'My Deck Shopping Basket',
        text: shareText,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
        }
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Basket copied to clipboard! (Sharing not supported on this browser)');
        });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Your Basket is Empty</h1>
        <p className="text-gray-400">Looks like you haven't added anything yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-40">
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">My Basket</h1>
        <div className="space-y-8">
          {creators.map(creator => {
            const creatorItems = groupedByCreator[creator.id];
            const subtotal = creatorItems.reduce((total, item) => {
              const product = getProductDetails(item.productId);
              return total + (product ? product.price * item.quantity : 0);
            }, 0);

            const prefilledMessage = `Hi ${creator.username}, I have a question about my order:\n${creatorItems.map(item => `- ${getProductDetails(item.productId)?.name} x${item.quantity}`).join('\n')}`;

            return (
              <div key={creator.id} className="bg-[#121212] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <img src={creator.avatarUrl} alt={creator.username} className="w-8 h-8 rounded-full" />
                        <span className="font-semibold">{creator.username}</span>
                    </div>
                    {onNavigateToChat && (
                        <button onClick={() => onNavigateToChat(creator, undefined, prefilledMessage)} className="p-2 rounded-full hover:bg-white/10">
                            <ChatBubbleIcon className="w-5 h-5 text-gray-300"/>
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                  {creatorItems.map((item) => {
                    const product = getProductDetails(item.productId);
                    if (!product) return null;
                    return (
                      <div key={`${item.productId}-${item.variantName}-${item.size}`} className="flex items-center gap-4">
                        <button 
                            onClick={() => onNavigateToProduct && onNavigateToProduct(product.id, item.variantName)}
                            disabled={!onNavigateToProduct}
                            className="flex items-center gap-4 flex-1 text-left disabled:cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-md -m-1 p-1 transition-all"
                            aria-label={`View details for ${product.name}`}
                        >
                            <img src={product.variants.find(v => v.name === item.variantName)?.mediaUrl || product.variants[0].mediaUrl} alt={product.name} className="w-16 h-20 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-gray-400">{item.variantName}{item.size && `, ${item.size}`}</p>
                              <p className="font-bold mt-1">${product.price.toFixed(2)}</p>
                            </div>
                        </button>
                        <div className="flex items-center gap-2 bg-gray-800 rounded-full p-1">
                           <button onClick={() => updateCartItemQuantity(item.productId, item.variantName, item.quantity - 1)} className="p-1" aria-label={`Remove one ${product.name}`}>
                            {item.quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-500" /> : <MinusIcon className="w-4 h-4" />}
                          </button>
                          <span className="w-6 text-center text-sm font-semibold" aria-live="polite" aria-label={`${item.quantity} of ${product.name} in cart`}>{item.quantity}</span>
                           <button onClick={() => updateCartItemQuantity(item.productId, item.variantName, item.quantity + 1)} className="p-1" aria-label={`Add one ${product.name}`}>
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                 <div className="text-right mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400">Subtotal: <span className="font-semibold text-white">${subtotal.toFixed(2)}</span></p>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 bg-[#1a1a1a] p-4 border-t border-gray-800">
          <div className="flex justify-between items-center mb-3">
              <p className="text-gray-300">Grand Total</p>
              <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShareCart} className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600">
                <ShareIcon className="w-6 h-6"/>
            </button>
            <button className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
              Alışverişi Tamamla
            </button>
          </div>
      </div>
    </div>
  );
};