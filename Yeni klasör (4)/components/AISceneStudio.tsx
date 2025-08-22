
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CloseIcon, PlusIcon, SparklesIcon, PhotographIcon } from './Icons.tsx';

interface AISceneStudioProps {
  onSave: (generatedImageUrl: string) => void;
  onClose: () => void;
}

const sceneThemes = [
    "Minimalist Studio",
    "Vibrant Street Style",
    "Cozy Cafe Setting",
    "Tropical Beach",
    "Modern Interior",
    "AI Surprise Me"
];

const loadingMessages = [
    "Ürün fotoğrafı analiz ediliyor...",
    "Sahne hazırlanıyor...",
    "Işıklar ayarlanıyor...",
    "Profesyonel arka plan oluşturuluyor...",
    "Gölgeler ekleniyor...",
    "Son dokunuşlar yapılıyor...",
];

export const AISceneStudio: React.FC<AISceneStudioProps> = ({ onSave, onClose }) => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string>(sceneThemes[0]);
  const [step, setStep] = useState(0); // 0: setup, 1: generating, 2: result
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (step === 1) {
      interval = window.setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!productImage) return;
    setStep(1);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      // Two-step process for reliability: 1. Describe, 2. Generate
      // STEP 1: Analyze image to get a description
      const analysisPrompt = "Briefly describe the product in the image, including its type and color (e.g., 'a blue cotton t-shirt on a hanger', 'a pair of white leather sneakers on a table').";
      const imagePart = {
        inlineData: {
          mimeType: productImage.split(';')[0].split(':')[1],
          data: productImage.split(',')[1],
        },
      };
      const textPart = { text: analysisPrompt };
      const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });
      const productDescription = analysisResponse.text;

      // STEP 2: Use the description to generate the new scene
      const generationPrompt = `
        **TASK:** Create a professional, photorealistic e-commerce lifestyle photo.
        **PRODUCT:** ${productDescription}.
        **SCENE THEME:** ${selectedScene}.
        
        **CRITICAL INSTRUCTIONS:**
        1. Place the described product naturally within the scene. The product should be the main focus.
        2. The final image MUST look like a professional photograph.
        3. The product's appearance (color, general shape) should be consistent with its description.
        4. The lighting and shadows on the product must be consistent with the new background scene.
      `;
      
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: generationPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
      });

      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;
        setGeneratedImage(`data:image/jpeg;base64,${base64Image}`);
        setStep(2);
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (err) {
      console.error("AI Scene Generation failed:", err);
      setError("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
      setStep(0);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1: // Generating
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fadeIn">
            <SparklesIcon className="w-16 h-16 text-purple-400 animate-pulse" />
            <h2 className="text-2xl font-bold font-serif mt-4 mb-2">Sahne Oluşturuluyor...</h2>
            <p className="text-gray-300 transition-opacity duration-500">{currentLoadingMessage}</p>
          </div>
        );
      case 2: // Result
        return (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-900/50">
              <img src={generatedImage!} alt="AI Generated Scene" className="max-h-full w-auto object-contain rounded-lg shadow-2xl" />
            </div>
            <div className="p-4 space-y-2 flex-shrink-0">
              <button onClick={() => onSave(generatedImage!)} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">Bu Görseli Kullan</button>
              <button onClick={() => { setStep(0); setGeneratedImage(null); }} className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600">Tekrar Dene</button>
            </div>
          </div>
        );
      default: // Upload/Setup
        return (
          <div className="flex flex-col h-full p-4 space-y-6">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold font-serif mb-2">AI Sahne Stüdyosu</h2>
              <p className="text-gray-400 mb-6">Ürün fotoğrafınızı profesyonel bir sahneye yerleştirin.</p>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors bg-cover bg-center" style={{ backgroundImage: productImage ? `url(${productImage})` : 'none' }}>
                {!productImage && (
                  <>
                    <PlusIcon className="w-10 h-10" />
                    <span className="mt-2 font-semibold">Görsel Seç</span>
                  </>
                )}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sahne Teması Seçin</label>
              <div className="flex flex-wrap gap-2">
                {sceneThemes.map(theme => (
                  <button key={theme} onClick={() => setSelectedScene(theme)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${selectedScene === theme ? 'bg-white text-black border-white' : 'border-gray-600'}`}>
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-lg">{error}</p>}
            <footer className="p-4 bg-black flex-shrink-0 -mx-4 -mb-4">
              <button onClick={handleGenerate} disabled={!productImage} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5" /> Oluştur
              </button>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex flex-col animate-fadeIn">
      <div className="w-full h-full max-w-md mx-auto flex flex-col bg-black text-white">
        <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PhotographIcon className="w-6 h-6 text-purple-400" />
            AI Sahne Stüdyosu
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-grow flex flex-col overflow-hidden">
          {renderContent()}
        </main>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};