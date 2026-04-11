import React, { useState, useCallback, useRef } from 'react';
import { generateArchitectureImage } from '../services/geminiService';

interface ArchitectureGeneratorModalProps {
  onClose: () => void;
  t: {
    title: string;
    sketchUpload: string;
    styleUpload: string;
    promptLabel: string;
    promptPlaceholder: string;
    generate: string;
    generating: string;
    error: string;
    close: string;
    saveImage: string;
    dragDrop: string;
    or: string;
    sketchPreview: string;
    stylePreview: string;
    result: string;
    clearSketch: string;
    clearStyle: string;
  };
}

const ArchitectureGeneratorModal: React.FC<ArchitectureGeneratorModalProps> = ({ onClose, t }) => {
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: 'sketch' | 'style') => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'sketch') {
          setSketchImage(result);
        } else {
          setStyleImage(result);
        }
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>, type: 'sketch' | 'style') => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'sketch') {
          setSketchImage(result);
        } else {
          setStyleImage(result);
        }
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sketchImage) {
      setError('Please upload a sketch image');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a description prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const url = await generateArchitectureImage({
        sketchImage,
        styleImage: styleImage || undefined,
        prompt: prompt.trim()
      });
      setResultImage(url);
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sketchImage, styleImage, prompt, t.error]);

  const handleSaveImage = useCallback(() => {
    if (!resultImage) return;

    const defaultFilename = 'architecture-design.png';
    const filename = window.prompt('Save image as:', defaultFilename);

    if (filename) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [resultImage]);

  const clearSketch = () => {
    setSketchImage(null);
    if (sketchInputRef.current) {
      sketchInputRef.current.value = '';
    }
  };

  const clearStyle = () => {
    setStyleImage(null);
    if (styleInputRef.current) {
      styleInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-7xl flex flex-col p-6 h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🏛️</span>
            <h2 className="text-xl font-bold text-dark-text">{t.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-light-text text-3xl leading-none hover:text-white"
            aria-label={t.close}
          >
            &times;
          </button>
        </header>
        
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Left Panel - Inputs */}
          <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto">
            {/* Sketch Upload */}
            <div className="flex flex-col">
              <label className="text-light-text font-semibold mb-2 flex items-center justify-between">
                <span>{t.sketchUpload}</span>
                {sketchImage && (
                  <button 
                    onClick={clearSketch}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    {t.clearSketch}
                  </button>
                )}
              </label>
              <div
                onDrop={(e) => handleDrop(e, 'sketch')}
                onDragOver={handleDragOver}
                onClick={() => sketchInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                  sketchImage 
                    ? 'border-accent bg-accent/10' 
                    : 'border-secondary/50 hover:border-accent/50 hover:bg-secondary/30'
                }`}
              >
                {sketchImage ? (
                  <div className="relative">
                    <img 
                      src={sketchImage} 
                      alt={t.sketchPreview} 
                      className="w-full h-48 object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">📐</div>
                    <p className="text-light-text text-sm mb-2">{t.dragDrop}</p>
                    <p className="text-light-text text-xs">{t.or} <span className="text-accent">click to browse</span></p>
                  </div>
                )}
                <input
                  ref={sketchInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'sketch')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Style Reference Upload */}
            <div className="flex flex-col">
              <label className="text-light-text font-semibold mb-2 flex items-center justify-between">
                <span>{t.styleUpload}</span>
                {styleImage && (
                  <button 
                    onClick={clearStyle}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    {t.clearStyle}
                  </button>
                )}
              </label>
              <div
                onDrop={(e) => handleDrop(e, 'style')}
                onDragOver={handleDragOver}
                onClick={() => styleInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                  styleImage 
                    ? 'border-accent bg-accent/10' 
                    : 'border-secondary/50 hover:border-accent/50 hover:bg-secondary/30'
                }`}
              >
                {styleImage ? (
                  <div className="relative">
                    <img 
                      src={styleImage} 
                      alt={t.stylePreview} 
                      className="w-full h-48 object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🎨</div>
                    <p className="text-light-text text-sm mb-2">{t.dragDrop}</p>
                    <p className="text-light-text text-xs">{t.or} <span className="text-accent">click to browse</span></p>
                  </div>
                )}
                <input
                  ref={styleInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'style')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Prompt Input */}
            <div className="flex flex-col flex-grow">
              <label htmlFor="prompt" className="text-light-text font-semibold mb-2">
                {t.promptLabel}
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
                className="w-full flex-grow bg-secondary border border-secondary/50 rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                disabled={isLoading}
                rows={6}
              />
            </div>

            {/* Generate Button */}
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !sketchImage || !prompt.trim()}
                className="w-full py-3 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 disabled:bg-secondary disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? t.generating : t.generate}
              </button>
              {resultImage && !isLoading && (
                <button
                  onClick={handleSaveImage}
                  className="w-full py-3 bg-secondary text-light-text font-bold rounded-lg shadow-lg hover:bg-secondary/70 transition-colors"
                >
                  {t.saveImage}
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Result Display */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex-grow bg-black rounded-lg flex items-center justify-center p-4 relative overflow-hidden">
              {isLoading && (
                <div className="flex flex-col items-center text-light-text">
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg">{t.generating}</p>
                  <p className="text-sm text-secondary mt-2">AI is transforming your sketch into architecture...</p>
                </div>
              )}
              
              {error && !isLoading && (
                <div className="text-center text-red-400 max-w-md">
                  <div className="text-5xl mb-4">⚠️</div>
                  <p className="text-lg">{error}</p>
                </div>
              )}
              
              {!isLoading && !error && !resultImage && (
                <div className="text-center text-secondary">
                  <div className="text-8xl mb-4">🏗️</div>
                  <p className="text-lg">Your architectural rendering will appear here</p>
                  <p className="text-sm mt-2">Upload a sketch and style reference to get started</p>
                </div>
              )}
              
              {resultImage && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={resultImage} 
                    alt={t.result} 
                    className="max-w-full max-h-full object-contain rounded-md"
                  />
                </div>
              )}
            </div>
            
            {/* Info Panel */}
            {resultImage && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-secondary/50">
                <h3 className="font-bold text-dark-text mb-2">✨ Generation Complete!</h3>
                <p className="text-light-text text-sm">
                  Your architectural design has been generated based on the sketch{styleImage ? ' and style reference' : ''}. 
                  You can save the image using the button above.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchitectureGeneratorModal;
