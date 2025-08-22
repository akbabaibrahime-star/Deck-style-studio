
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { users, products as mockProducts, chatMessages } from './data/mockData.ts';
import type { User, Product, UserSummary, CartItem, Deck, AiChatMessage } from './types.ts';

import { Feed } from './components/Feed.tsx';
import { Profile } from './components/Profile.tsx';
import { CreatorProfile } from './components/CreatorProfile.tsx';
import { SavedView } from './components/SavedView.tsx';
import { BasketView } from './components/BasketView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { EditProfile } from './components/EditProfile.tsx';
import { CreateDeck } from './components/CreateDeck.tsx';
import { EditDeck } from './components/EditDeck.tsx';
import { DeckDetailView } from './components/DeckDetailView.tsx';
import { PublicProfileView } from './components/PublicProfileView.tsx';
import { AIVideoStudio } from './components/AIVideoStudio.tsx';
import { HomeIcon, UserIcon, BookmarkIcon, ShoppingBagIcon, ArrowLeftIcon, SparklesIcon, CloseIcon, PlusIcon, RulerIcon } from './components/Icons.tsx';

type ViewType = 'feed' | 'profile' | 'creatorProfile' | 'saved' | 'basket' | 'chat' | 'editProfile' | 'createDeck' | 'deckDetail' | 'editDeck' | 'publicProfile' | 'aiStylist';

interface ViewState {
  view: ViewType;
  props?: any;
}

// --- START OF IN-APP COMPONENTS ---

const FitFinder: React.FC<{ product: Product, onClose: () => void, onSizeFound: (size: string) => void }> = ({ product, onClose, onSizeFound }) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleFindSize = () => {
        const h = parseInt(height);
        const w = parseInt(weight);
        if (isNaN(h) || isNaN(w) || !product.sizes) {
            setResult("Lütfen geçerli değerler girin.");
            return;
        }

        // Mock logic for size suggestion
        const bmi = (w / ((h/100) * (h/100)));
        let suggestedSize = product.sizes[Math.floor(product.sizes.length / 2)]; // Default to medium
        if (bmi < 18.5 && product.sizes.includes('S')) suggestedSize = 'S';
        else if (bmi < 20 && product.sizes.includes('M')) suggestedSize = 'M';
        else if (bmi >= 20 && bmi < 25 && product.sizes.includes('M')) suggestedSize = 'M';
        else if (bmi >= 25 && bmi < 30 && product.sizes.includes('L')) suggestedSize = 'L';
        else if (bmi >= 30 && product.sizes.includes('XL')) suggestedSize = 'XL';

        setResult(`Önerilen bedeniniz: ${suggestedSize}`);
        onSizeFound(suggestedSize);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={onClose}>
            <div className="bg-[#121212] rounded-lg p-6 w-full max-w-sm transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold font-serif mb-4">Bedenimi Bul</h3>
                <p className="text-sm text-gray-400 mb-4">{product.name} için en uygun bedeni bulmanıza yardımcı olalım.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Boy (cm)</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Örn: 175" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Kilo (kg)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Örn: 70" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
                    </div>
                    <button onClick={handleFindSize} className="w-full bg-blue-600 font-bold py-2 rounded-lg">Bedenimi Bul</button>
                    {result && <p className="text-center font-semibold pt-2">{result}</p>}
                </div>
            </div>
        </div>
    );
};

const QuickShopSheet: React.FC<{ product: Product, onClose: () => void, onAddToCart: (productId: string, variantName: string, size?: string) => void }> = ({ product, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes ? product.sizes[0] : undefined);
    
    return (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fadeIn" onClick={onClose}>
            <div className="fixed bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-6 transform animate-slideUp" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-4">
                    <img src={product.variants[0].mediaUrl} alt={product.name} className="w-24 h-32 object-cover rounded-lg"/>
                    <div className="flex-1 space-y-2">
                        <h3 className="font-bold font-serif text-xl">{product.name}</h3>
                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                         {product.sizes && (
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1 text-xs rounded-full border ${selectedSize === size ? 'bg-white text-black border-white' : 'border-white/50 text-white/80'}`}>
                                    {size}
                                </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={() => { onAddToCart(product.id, product.variants[0].name, selectedSize); onClose(); }} className="w-full bg-white text-black font-bold py-3 mt-4 rounded-lg flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5"/> SEPETE EKLE
                </button>
            </div>
        </div>
    );
};

// --- END OF IN-APP COMPONENTS ---


const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [currentUser, setCurrentUser] = useState<User>(() => allUsers.find(u => u.id === 'user1')!);
  
  const [viewHistory, setViewHistory] = useState<ViewState[]>([{ view: 'feed' }]);
  
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set());
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set(['prod1']));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [productToShow, setProductToShow] = useState<{ productId: string; variantName: string } | null>(null);
  
  // State for new features
  const [fitFinderProduct, setFitFinderProduct] = useState<Product | null>(null);
  const [quickShopProduct, setQuickShopProduct] = useState<Product | null>(null);
  const [deckForVideo, setDeckForVideo] = useState<Deck | null>(null);
  const [aiChat, setAiChat] = useState<Chat | null>(null);
  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([{ role: 'model', text: 'Merhaba! Ben sizin kişisel stil danışmanınızım. Ne tür bir kombin arıyorsunuz?' }]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // State for public (shared) view
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicCart, setPublicCart] = useState<CartItem[]>([]);
  const urlParamsHandled = useRef(false);

  useEffect(() => {
    // Initialize Gemini Chat
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a friendly and knowledgeable fashion stylist. Your goal is to help users find their perfect style by giving them advice, suggesting outfits, and explaining fashion concepts. Keep your answers concise, helpful, and inspiring. Respond in Turkish.",
            },
        });
        setAiChat(chatInstance);
    } catch (error) {
        console.error("Gemini API initialization failed.", error);
        setAiChatHistory(prev => [...prev, { role: 'model', text: "Stil danışmanı şu an çevrimdışı. Lütfen daha sonra tekrar deneyin."}])
    }
  }, []);

  useEffect(() => {
     aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  useEffect(() => {
    if (urlParamsHandled.current || viewHistory.length > 1) return;
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const deckId = params.get('deckId');
    const productId = params.get('productId');
    
    let paramsWereHandled = false;
    if (userId) {
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        setIsPublicView(true);
        if (deckId) {
            const deck = user.decks.find(d => d.id === deckId);
            if(deck) setViewHistory([{ view: 'publicProfile', props: { user } }, { view: 'deckDetail', props: { deck, allProducts } }]);
            else setViewHistory([{ view: 'publicProfile', props: { user } }]);
        } else {
            setViewHistory([{ view: 'publicProfile', props: { user } }]);
        }
        paramsWereHandled = true;
      }
    } else if (productId) {
        const productToShow = allProducts.find(p => p.id === productId);
        if (productToShow) {
            setAllProducts([productToShow, ...allProducts.filter(p => p.id !== productId)]);
            paramsWereHandled = true;
        }
    }
    if (paramsWereHandled) urlParamsHandled.current = true;
  }, [allUsers, allProducts, viewHistory.length]);


  const currentView = viewHistory[viewHistory.length - 1];
  const activeCart = isPublicView ? publicCart : cart;
  const setActiveCart = isPublicView ? setPublicCart : setCart;

  const navigateTo = useCallback((view: ViewType, props: any = {}) => { setViewHistory(prev => [...prev, { view, props }]); }, []);
  const goBack = () => { if (viewHistory.length > 1) setViewHistory(prev => prev.slice(0, -1)); };
  const resetToView = (view: ViewType) => { if (isPublicView || currentView.view === view) return; setViewHistory([{ view: view, props: {} }]); };
  const handleLikeToggle = (productId: string) => { setLikedProductIds(prev => { const newSet = new Set(prev); if (newSet.has(productId)) newSet.delete(productId); else newSet.add(productId); return newSet; }); };
  const handleSaveToggle = (productId: string) => { setSavedProductIds(prev => { const newSet = new Set(prev); if (newSet.has(productId)) newSet.delete(productId); else newSet.add(productId); return newSet; }); };

  const handleAddToCart = (productId: string, variantName: string, size?: string) => {
    setActiveCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === productId && item.variantName === variantName && item.size === size);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { productId, variantName, size, quantity: 1 }];
    });
    setToastMessage("Sepete Eklendi!");
    setTimeout(() => setToastMessage(null), 2000);
    if (isPublicView) navigateTo('basket');
  };
  
  const updateCartItemQuantity = (productId: string, variantName: string, newQuantity: number) => {
    if (newQuantity <= 0) setActiveCart(prev => prev.filter(item => !(item.productId === productId && item.variantName === variantName)));
    else setActiveCart(prev => prev.map(item => item.productId === productId && item.variantName === variantName ? { ...item, quantity: newQuantity } : item));
  };

  const onNavigateToCreator = (creator: UserSummary) => { const fullCreatorProfile = allUsers.find(u => u.id === creator.id); if(fullCreatorProfile) navigateTo('creatorProfile', { creator: fullCreatorProfile }); };
  const onNavigateToChat = (otherUser: User, productContext?: Product, prefilledMessage?: string) => { navigateTo('chat', { otherUser, productContext, initialMessages: chatMessages, prefilledMessage }); };
  const onNavigateToDeck = (deck: Deck) => { navigateTo('deckDetail', { deck, allProducts: allProducts }); };

  const generateShareUrl = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    url.search = '';
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  };

  const handleGenericShare = async (title: string, text: string, url: string) => {
    if (navigator.share) {
        try { await navigator.share({ title, text, url }); return; } catch (err) { if (err instanceof Error && err.name === 'AbortError') return; console.error('Share API failed, falling back...', err); }
    }
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(url); setToastMessage('Link panoya kopyalandı!'); setTimeout(() => setToastMessage(null), 3000); return; } catch (err) { console.error('Clipboard copy failed, falling back to dialog...', err); }
    }
    setShareUrl(url);
  };
  
  const handleShareProfile = (userId: string) => { const user = allUsers.find(u => u.id === userId); if (!user) return; handleGenericShare(`${user.username}'s Profile`, `Check out ${user.username}'s collections on Deck!`, generateShareUrl({ userId })); };
  const handleShareDeck = (deckId: string) => { const deck = currentUser.decks.find(d => d.id === deckId); if (!deck) return; handleGenericShare(`${deck.name} by ${currentUser.username}`, `Check out the "${deck.name}" collection on Deck!`, generateShareUrl({ userId: currentUser.id, deckId })); };
  const handleShareProduct = (product: Product) => { handleGenericShare(product.name, `Check out this product on Deck: ${product.name} by ${product.creator.username}`, generateShareUrl({ productId: product.id })); };
  
  const handleUpdateProfile = (updatedUser: User) => { setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); goBack(); };
  
  const handleCreateDeck = (deckData: { name: string; mediaUrls: string[]; products: Omit<Product, 'id' | 'creator'>[] }) => {
    const creatorSummary: UserSummary = { id: currentUser.id, username: currentUser.username, avatarUrl: currentUser.avatarUrl };
    const newFullProducts: Product[] = deckData.products.map((p, i) => ({ ...p, id: `prod-new-${Date.now()}-${i}`, creator: creatorSummary }));
    const newDeck: Deck = { id: `deck${Date.now()}`, name: deckData.name, mediaUrls: deckData.mediaUrls, productCount: newFullProducts.length, productIds: newFullProducts.map(p => p.id) };
    const updatedUser = { ...currentUser, decks: [...currentUser.decks, newDeck] };
    setAllProducts(prev => [...newFullProducts, ...prev]);
    setCurrentUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    goBack();
  };

  const handleCreateProduct = (productData: Omit<Product, 'id' | 'creator'>): Product => {
    const creatorSummary: UserSummary = { id: currentUser.id, username: currentUser.username, avatarUrl: currentUser.avatarUrl, };
    const newProduct: Product = { ...productData, id: `prod-new-${Date.now()}`, creator: creatorSummary };
    setAllProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };
  
  const handleEditDeck = (deck: Deck) => { navigateTo('editDeck', { deck }); };
  const handleUpdateDeck = (updatedDeck: Deck) => { const updatedUser = { ...currentUser, decks: currentUser.decks.map(d => d.id === updatedDeck.id ? updatedDeck : d) }; setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); goBack(); };
  const handleDeleteDeck = (deckId: string) => { if (window.confirm('Bu decki silmek istediğinizden emin misiniz?')) { const updatedUser = { ...currentUser, decks: currentUser.decks.filter(d => d.id !== deckId) }; setCurrentUser(updatedUser); setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)); } };
  const handleOpenVideoStudio = (deck: Deck) => setDeckForVideo(deck);

  const handleNavigateToProduct = (productId: string, variantName: string) => {
    const product = allProducts.find(p => p.id === productId); if (!product) return;
    setAllProducts([product, ...allProducts.filter(p => p.id !== productId)]);
    setProductToShow({ productId, variantName });
    resetToView('feed');
  };

  const handleSendAiMessage = async (message: string) => {
    if (!aiChat || isAiLoading) return;
    setIsAiLoading(true);
    setAiChatHistory(prev => [...prev, { role: 'user', text: message }]);
    
    try {
        const result = await aiChat.sendMessageStream({ message });
        let text = '';
        setAiChatHistory(prev => [...prev, {role: 'model', text: '', isLoading: true}]);
        for await (const chunk of result) {
            text += chunk.text;
            setAiChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', text, isLoading: true };
                return newHistory;
            });
        }
        setAiChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', text };
            return newHistory;
        });

    } catch (error) {
        console.error("AI chat error:", error);
        setAiChatHistory(prev => [...prev, { role: 'model', text: "Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin." }]);
    } finally {
        setIsAiLoading(false);
    }
  };


  const savedProductsList = useMemo(() => allProducts.filter(p => savedProductIds.has(p.id)), [savedProductIds, allProducts]);
  const likedProductsList = useMemo(() => allProducts.filter(p => likedProductIds.has(p.id)), [likedProductIds, allProducts]);
  const cartItemCount = useMemo(() => activeCart.reduce((sum, item) => sum + item.quantity, 0), [activeCart]);

  const renderView = () => {
    switch (currentView.view) {
      case 'feed': return <Feed products={allProducts} allProducts={allProducts} likedProductIds={likedProductIds} savedProductIds={savedProductIds} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} onAddToCart={handleAddToCart} onNavigateToCreator={onNavigateToCreator} onNavigateToChat={onNavigateToChat} onShare={handleShareProduct} productToShow={productToShow} onProductShown={() => setProductToShow(null)} onOpenFitFinder={(p) => setFitFinderProduct(p)} onShopTheLookItemClick={(p) => setQuickShopProduct(p)} />;
      case 'profile': return <Profile user={currentUser} onEditProfile={() => navigateTo('editProfile')} onCreateDeck={() => navigateTo('createDeck')} onNavigateToDeck={onNavigateToDeck} onEditDeck={handleEditDeck} onDeleteDeck={handleDeleteDeck} onShareProfile={handleShareProfile} onShareDeck={handleShareDeck} onGenerateVideoForDeck={handleOpenVideoStudio} />;
      case 'creatorProfile': return <CreatorProfile creator={currentView.props.creator} onNavigateToChat={onNavigateToChat} onNavigateToDeck={onNavigateToDeck} />;
      case 'saved': return <SavedView savedProducts={savedProductsList} likedProducts={likedProductsList} />;
      case 'basket': return <BasketView cart={activeCart} products={allProducts} updateCartItemQuantity={updateCartItemQuantity} onNavigateToChat={isPublicView ? undefined : onNavigateToChat} onNavigateToProduct={isPublicView ? undefined : handleNavigateToProduct} />;
      case 'chat': return <ChatView currentUser={currentUser} {...currentView.props} />;
      case 'editProfile': return <EditProfile user={currentUser} onSave={handleUpdateProfile} />;
      case 'createDeck': return <CreateDeck onCreate={handleCreateDeck} />;
      case 'editDeck': return <EditDeck deck={currentView.props.deck} allProducts={allProducts} onSave={handleUpdateDeck} onCreateProduct={handleCreateProduct} />;
      case 'deckDetail': return <DeckDetailView {...currentView.props} />;
      case 'publicProfile': return <PublicProfileView user={currentView.props.user} onNavigateToDeck={onNavigateToDeck} onShareProfile={handleShareProfile} />;
      case 'aiStylist':
        const AiStylistView = () => {
            const [input, setInput] = useState('');
            return (
              <div className="bg-black text-white h-screen flex flex-col pt-12 pb-16">
                <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-center gap-3 bg-[#121212] border-b border-gray-800">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  <h1 className="font-bold text-lg font-serif">AI Stil Danışmanı</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                  {aiChatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>}
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-[#262626] rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}{msg.isLoading && <span className="inline-block w-2 h-2 ml-2 bg-white rounded-full animate-ping"></span>}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={aiChatEndRef} />
                </main>
                <footer className="absolute bottom-16 left-0 right-0 p-2 border-t border-gray-800 bg-black">
                  <form onSubmit={(e) => { e.preventDefault(); if(input.trim()) { handleSendAiMessage(input); setInput(''); } }} className="flex items-center gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Bir stil sorusu sorun..." className="flex-1 bg-[#262626] border border-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none" />
                    <button type="submit" disabled={isAiLoading || !input.trim()} className="bg-blue-600 rounded-full p-2 disabled:bg-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                  </form>
                </footer>
              </div>
            );
        };
        return <AiStylistView />;
      default: return isPublicView && currentView.props.user ? <PublicProfileView user={currentView.props.user} onNavigateToDeck={onNavigateToDeck} onShareProfile={handleShareProfile} /> : <Feed products={allProducts} allProducts={allProducts} likedProductIds={likedProductIds} savedProductIds={savedProductIds} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} onAddToCart={handleAddToCart} onNavigateToCreator={onNavigateToCreator} onNavigateToChat={onNavigateToChat} onShare={handleShareProduct} productToShow={productToShow} onProductShown={() => setProductToShow(null)} onOpenFitFinder={(p) => setFitFinderProduct(p)} onShopTheLookItemClick={(p) => setQuickShopProduct(p)} />;
    }
  };
  
  const showBottomNav = !isPublicView && ['feed', 'saved', 'basket', 'profile', 'aiStylist'].includes(currentView.view);
  const showBackButton = (viewHistory.length > 1 && !showBottomNav) || (isPublicView && viewHistory.length > 1);
  const showPublicCartButton = isPublicView && cartItemCount > 0 && currentView.view !== 'basket';

  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-black text-white overflow-hidden relative font-sans">
      {showBackButton && <button onClick={goBack} className="absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full"><ArrowLeftIcon className="w-6 h-6" /></button>}
      {showPublicCartButton && <button onClick={() => navigateTo('basket')} className="absolute top-4 right-4 z-30 p-2 bg-white/90 text-black rounded-full shadow-lg flex items-center justify-center"><ShoppingBagIcon className="w-6 h-6"/><span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span></button>}
      
      <div className="h-full w-full">{renderView()}</div>
      
      {toastMessage && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm py-2 px-4 rounded-full z-[60]">{toastMessage}</div>}
      {fitFinderProduct && <FitFinder product={fitFinderProduct} onClose={() => setFitFinderProduct(null)} onSizeFound={(size) => { console.log(size); }}/>}
      {quickShopProduct && <QuickShopSheet product={quickShopProduct} onClose={() => setQuickShopProduct(null)} onAddToCart={handleAddToCart}/>}
      {deckForVideo && <AIVideoStudio deck={deckForVideo} allProducts={allProducts} onClose={() => setDeckForVideo(null)} />}


      {shareUrl && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 animate-fadeIn-dialog" onClick={() => setShareUrl(null)}>
          <div className="bg-[#121212] rounded-lg p-6 w-full max-w-sm text-center transform animate-slideUp-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Linki Paylaş</h3>
            <p className="text-sm text-gray-300 mb-4">Otomatik paylaşım kullanılamıyor. Lütfen aşağıdaki linki kopyalayın.</p>
            <div className="relative">
                <input type="text" value={shareUrl} readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-20 pl-3 py-2 text-left text-sm" onFocus={(e) => e.target.select()} aria-label="Shareable link" />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => setToastMessage('Link panoya kopyalandı!')).catch(() => setToastMessage('Kopyalanamadı.')).finally(() => setTimeout(() => setToastMessage(null), 2000)) }} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-md">Kopyala</button>
            </div>
            <button onClick={() => setShareUrl(null)} className="mt-4 w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Kapat</button>
          </div>
        </div>
      )}

      {showBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 pointer-events-auto">
              <div className="flex justify-around items-center h-16 px-2">
                <BottomNavItem icon={HomeIcon} view="feed" currentView={currentView.view} onClick={resetToView} />
                <BottomNavItem icon={BookmarkIcon} view="saved" currentView={currentView.view} onClick={resetToView} />
                <BottomNavItem icon={SparklesIcon} view="aiStylist" currentView={currentView.view} onClick={resetToView} isCentral />
                <BottomNavItem icon={ShoppingBagIcon} view="basket" currentView={currentView.view} onClick={resetToView} badgeCount={cartItemCount}/>
                <BottomNavItem icon={UserIcon} view="profile" currentView={currentView.view} onClick={resetToView} />
              </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn-dialog { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn-dialog { animation: fadeIn-dialog 0.2s ease-out forwards; }
        @keyframes slideUp-dialog { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp-dialog { animation: slideUp-dialog 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

interface BottomNavItemProps { icon: React.ElementType; view: ViewType; currentView: ViewType; onClick: (view: ViewType) => void; badgeCount?: number; isCentral?: boolean; }
const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon: Icon, view, currentView, onClick, badgeCount, isCentral }) => {
    const isActive = view === currentView;
    return (
        <button onClick={() => onClick(view)} className={`relative p-2 flex-1 flex justify-center items-center transition-transform duration-200 ${isActive && isCentral ? 'scale-110' : ''}`}>
            {isCentral ? (
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center transform transition-all duration-300 ${isActive ? 'bg-purple-600 -translate-y-4 shadow-lg shadow-purple-900/50' : 'bg-gray-700'}`}>
                    <Icon className="w-7 h-7 text-white" />
                 </div>
            ) : (
                <>
                <Icon className={`w-7 h-7 transition-all ${isActive ? 'text-white scale-110' : 'text-gray-400'}`} />
                {badgeCount && badgeCount > 0 && <span className="absolute top-1 right-[25%] bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{badgeCount}</span>}
                </>
            )}
        </button>
    );
};

export default App;