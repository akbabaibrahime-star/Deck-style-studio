
import React, { useEffect, useState, useRef } from 'react';
import type { Product, UserSummary } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';

interface FeedProps {
  products: Product[];
  allProducts: Product[]; // For Shop The Look
  likedProductIds: Set<string>;
  savedProductIds: Set<string>;
  onLikeToggle: (productId: string) => void;
  onSaveToggle: (productId: string) => void;
  onAddToCart: (productId: string, variantName: string, size?: string) => void;
  onNavigateToCreator: (creator: UserSummary) => void;
  onNavigateToChat: (creator: UserSummary, product: Product) => void;
  onShare: (product: Product) => void;
  onOpenFitFinder: (product: Product) => void;
  onShopTheLookItemClick: (product: Product) => void;
  productToShow?: { productId: string; variantName: string } | null;
  onProductShown: () => void;
}

export const Feed: React.FC<FeedProps> = (props) => {
  const { productToShow, onProductShown } = props;
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
          const productId = (entry.target as HTMLElement).dataset.productId;
          if (productId) {
            setActiveProductId(productId);
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersect, { threshold: 0.75 });

    if (!productToShow && props.products.length > 0) {
      setActiveProductId(props.products[0].id);
    }

    const currentObserver = observer.current;
    return () => currentObserver?.disconnect();
  }, [productToShow, props.products]);

  useEffect(() => {
    if (productToShow) {
      onProductShown();
      const element = document.querySelector(`[data-product-id="${productToShow.productId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'instant' });
      }
      setActiveProductId(productToShow.productId);
    }
  }, [productToShow, onProductShown]);

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {props.products.map(product => {
        let initialVariantIndex: number | undefined;
        if (productToShow && product.id === productToShow.productId) {
          const foundIndex = product.variants.findIndex(v => v.name === productToShow.variantName);
          initialVariantIndex = foundIndex !== -1 ? foundIndex : 0;
        }

        return (
          <ProductCard
            key={product.id}
            product={product}
            allProducts={props.allProducts}
            isLiked={props.likedProductIds.has(product.id)}
            isSaved={props.savedProductIds.has(product.id)}
            onLikeToggle={props.onLikeToggle}
            onSaveToggle={props.onSaveToggle}
            onAddToCart={props.onAddToCart}
            onNavigateToCreator={props.onNavigateToCreator}
            onNavigateToChat={props.onNavigateToChat}
            onShare={props.onShare}
            onOpenFitFinder={props.onOpenFitFinder}
            onShopTheLookItemClick={props.onShopTheLookItemClick}
            initialVariantIndex={initialVariantIndex}
            isActive={activeProductId === product.id}
            observer={observer.current}
          />
        );
      })}
    </div>
  );
};