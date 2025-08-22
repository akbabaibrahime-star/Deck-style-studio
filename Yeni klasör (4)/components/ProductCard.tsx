
import React, { useState, useEffect, useRef } from 'react';
import type { Product, UserSummary } from '../types.ts';
import { HeartIcon, ChatBubbleIcon, BookmarkIcon, ShareIcon, InfoIcon, TagIcon, VolumeUpIcon, VolumeOffIcon, RulerIcon, PlusIcon } from './Icons.tsx';
import { ProductDetailSheet } from './ProductDetailSheet.tsx';

interface ShopTheLookBubbleProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ShopTheLookBubble: React.FC<ShopTheLookBubbleProps> = ({ product, onClick }) => {
    return (
        <button 
            onClick={() => onClick(product)} 
            className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full shadow-lg transition-transform hover:scale-105"
        >
            <img src={product.variants[0].mediaUrl} alt={product.name} className="w-8 h-8 rounded-full object-cover" />
            <div className="pr-2 text-left">
                <p className="text-xs font-semibold leading-tight">{product.name}</p>
                <p className="text-xs text-white/70 leading-tight">${product.price.toFixed(2)}</p>
            </div>
        </button>
    );
};

interface ProductCardProps {
  product: Product;
  allProducts: Product[];
  isLiked: boolean;
  isSaved: boolean;
  onLikeToggle: (productId: string) => void;
  onSaveToggle: (productId: string) => void;
  onAddToCart: (productId: string, variantName: string, size?: string) => void;
  onNavigateToCreator: (creator: UserSummary) => void;
  onNavigateToChat: (creator: UserSummary, product: Product) => void;
  onShare: (product: Product) => void;
  onOpenFitFinder: (product: Product) => void;
  onShopTheLookItemClick: (product: Product) => void;
  initialVariantIndex?: number;
  isActive: boolean;
  observer?: IntersectionObserver | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  allProducts,
  isLiked,
  isSaved,
  onLikeToggle,
  onSaveToggle,
  onAddToCart,
  onNavigateToCreator,
  onNavigateToChat,
  onShare,
  onOpenFitFinder,
  onShopTheLookItemClick,
  initialVariantIndex,
  isActive,
  observer,
}) => {
  const [activeVariantIndex, setActiveVariantIndex] = useState(initialVariantIndex ?? 0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const volumeIndicatorTimeout = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialVariantIndex !== undefined) {
      setActiveVariantIndex(initialVariantIndex);
    }
  }, [initialVariantIndex]);
  
  useEffect(() => {
    if (!isActive) {
      setIsMuted(true);
    }
  }, [isActive]);
  
  useEffect(() => {
    const node = cardRef.current;
    if (node && observer) {
        observer.observe(node);
        return () => observer.unobserve(node);
    }
  }, [observer]);

  useEffect(() => {
    return () => {
      if (volumeIndicatorTimeout.current) {
        clearTimeout(volumeIndicatorTimeout.current);
      }
    };
  }, []);

  const activeVariant = product.variants[activeVariantIndex];
  const shopTheLookProducts = product.shopTheLookProductIds
    ?.map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p) ?? [];

  const handleAddToCartClick = () => {
    onAddToCart(product.id, activeVariant.name, selectedSize);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || e.changedTouches.length !== 1) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    const threshold = 50;

    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('button, a, [onclick]')) {
        setTouchStartX(null);
        return;
    }

    if (Math.abs(swipeDistance) < 10) {
      if (activeVariant.mediaType === 'video') {
        setIsMuted(prev => !prev);
        setShowVolumeIndicator(true);

        if (volumeIndicatorTimeout.current) {
            clearTimeout(volumeIndicatorTimeout.current);
        }

        volumeIndicatorTimeout.current = window.setTimeout(() => {
            setShowVolumeIndicator(false);
        }, 1500);
      }
    } else if (swipeDistance > threshold) {
      if (activeVariantIndex < product.variants.length - 1) {
        setActiveVariantIndex(prev => prev + 1);
      }
    } else if (swipeDistance < -threshold) {
      if (activeVariantIndex > 0) {
        setActiveVariantIndex(prev => prev - 1);
      }
    }
    
    setTouchStartX(null);
  };


  return (
    <div 
        ref={cardRef}
        data-product-id={product.id}
        className="h-screen w-full snap-start relative text-white overflow-hidden font-sans"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 z-0 bg-black">
        {activeVariant.mediaType === 'image' ? (
          <img src={activeVariant.mediaUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <video src={activeVariant.mediaUrl} autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover" />
        )}
        
        {activeVariant.mediaType === 'video' && showVolumeIndicator && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-fadeInOut pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full">
                    {isMuted ? <VolumeOffIcon className="w-10 h-10 text-white" /> : <VolumeUpIcon className="w-10 h-10 text-white" />}
                </div>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full p-4 pb-24">
        <header className="flex justify-between items-start">
          <div
            className="flex items-center gap-3 bg-black/40 backdrop-blur-sm p-2 rounded-full cursor-pointer"
            onClick={() => onNavigateToCreator(product.creator)}
          >
            <img src={product.creator.avatarUrl} alt={product.creator.username} className="w-9 h-9 rounded-full" />
            <span className="font-semibold text-sm pr-2">{product.creator.username}</span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm p-2 rounded-full">
            {product.variants.map((variant, index) => (
              <button
                key={variant.name}
                onClick={() => setActiveVariantIndex(index)}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${index === activeVariantIndex ? 'border-white scale-125' : 'border-transparent opacity-70'}`}
                style={{ backgroundColor: variant.color }}
                aria-label={`Select ${variant.name} variant`}
              />
            ))}
          </div>
        </header>
        
        <div className="absolute top-1/2 -translate-y-1/2 left-4 space-y-3">
            {shopTheLookProducts.map(item => (
                <ShopTheLookBubble key={item.id} product={item} onClick={onShopTheLookItemClick}/>
            ))}
        </div>

        <footer className="flex items-end justify-between">
          <div className="flex-1 space-y-4 mr-4">
            <h2 className="text-4xl font-bold font-serif leading-tight tracking-tight">{product.name}</h2>
            <p className="text-sm leading-snug text-white/90 line-clamp-2">{product.description}</p>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <TagIcon className="w-5 h-5 text-white/80" />
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                </div>
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex gap-2 items-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                      {product.sizes.slice(0, 3).map(size => (
                      <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/50 text-white/80'}`}
                      >
                          {size}
                      </button>
                      ))}
                      <button onClick={() => onOpenFitFinder(product)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                          <RulerIcon className="w-5 h-5" />
                      </button>
                  </div>
                )}
            </div>
             <button 
                onClick={handleAddToCartClick} 
                className="bg-white/90 text-black font-bold py-3 px-8 rounded-full text-base shadow-lg hover:bg-white transition-transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
            >
                <PlusIcon className="w-5 h-5" />
                <span>SEPETE EKLE</span>
            </button>
          </div>

          <aside className="flex flex-col gap-5 items-center">
            <button onClick={() => onLikeToggle(product.id)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <HeartIcon className={`w-8 h-8 transition-colors ${isLiked ? 'fill-red-500 stroke-red-500' : 'fill-transparent'}`} />
              <span className="text-xs font-semibold">Like</span>
            </button>
            <button onClick={() => onNavigateToChat(product.creator, product)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <ChatBubbleIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">Chat</span>
            </button>
            <button onClick={() => onSaveToggle(product.id)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <BookmarkIcon className={`w-8 h-8 transition-colors ${isSaved ? 'fill-white' : 'fill-transparent'}`} />
              <span className="text-xs font-semibold">Save</span>
            </button>
            <button onClick={() => setShowDetails(true)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <InfoIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">Info</span>
            </button>
            <button onClick={() => onShare(product)} className="flex flex-col items-center gap-1 p-2 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
              <ShareIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">Share</span>
            </button>
          </aside>
        </footer>
      </div>
      
      {showDetails && <ProductDetailSheet product={product} onClose={() => setShowDetails(false)} />}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 80% { opacity: 1; }
        }
        .animate-fadeInOut { animation: fadeInOut 1.5s ease-in-out forwards; }
        .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};