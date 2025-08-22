export interface MediaVariant {
  color: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  name: string;
}

export interface Product {
  id: string;
  name:string;
  price: number;
  description: string;
  fabric: {
    name: string;
    description: string;
    closeUpImageUrl: string;
    movementVideoUrl: string;
  };
  variants: MediaVariant[];
  creator: UserSummary;
  sizes?: string[];
  shopTheLookProductIds?: string[];
}

export interface UserSummary {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface Deck {
  id: string;
  name: string;
  mediaUrls: string[];
  productCount: number;
  productIds: string[];
}

export interface User extends UserSummary {
  bio: string;
  decks: Deck[];
  contact: {
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface CartItem {
  productId: string;
  variantName: string;
  quantity: number;
  size?: string;
}

export interface AiChatMessage {
    role: 'user' | 'model';
    text: string;
    isLoading?: boolean;
}

export interface VideoScene {
  imageUrl: string;
  duration: number; // in milliseconds
  textOverlay: string;
  animationStyle: string;
}