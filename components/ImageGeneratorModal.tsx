import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AppInfo, Message } from '../types';
import { generateImage, sendMessageToAgent } from '../services/geminiService';

interface ImageGeneratorModalProps {
  app: AppInfo;
  onClose: () => void;
  t: {
    title: string;
    promptPlaceholder: string;
    generate: string;
    generating: string;
    error: string;
    close: string;
    saveImage: string;
    saveImageFilenamePrompt: string;
    agentTitle: string;
    welcomeMessage: string;
    chatPlaceholder: string;
  };
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words ${
          isUser
            ? 'bg-accent text-white rounded-br-none'
            : 'bg-secondary text-light-text rounded-bl-none'
        }`}
        dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
      >
      </div>
    </div>
  );
};


const ImageGeneratorModal: React.FC<ImageGeneratorModalProps> = ({ app, onClose, t }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t.welcomeMessage, sender: 'ai' }]);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, t.error]);
  
  const handleSaveImage = useCallback(() => {
    if (!imageUrl) return;

    const defaultFilename = 'dmp-ai-image.png';
    const filename = window.prompt(t.saveImageFilenamePrompt, defaultFilename);

    if (filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }, [imageUrl, t.saveImageFilenamePrompt]);
  
  const handleSendMessage = useCallback(async () => {
    if (chatInputValue.trim() === '' || isChatLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: chatInputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInputValue('');
    setIsChatLoading(true);

    const aiResponseText = await sendMessageToAgent(chatInputValue, app);
    
    const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsChatLoading(false);

  }, [chatInputValue, isChatLoading, app]);

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
            <span className="text-3xl mr-3">{app.icon}</span>
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
        <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
          {/* Controls */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <p className="text-sm text-light-text">{app.description}</p>
            <div className="flex-grow flex flex-col">
              <label htmlFor="prompt" className="text-light-text font-semibold mb-2">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
                className="w-full flex-grow bg-secondary border border-secondary/50 rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                disabled={isLoading}
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full py-3 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 disabled:bg-secondary disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? t.generating : t.generate}
              </button>
              {imageUrl && !isLoading && (
                <button
                  onClick={handleSaveImage}
                  className="w-full py-3 bg-secondary text-light-text font-bold rounded-lg shadow-lg hover:bg-secondary/70 transition-colors"
                >
                  {t.saveImage}
                </button>
              )}
            </div>
          </div>

          {/* Image Display */}
          <div className="md:col-span-5 flex-grow bg-black rounded-lg flex items-center justify-center p-4 relative overflow-hidden">
            {isLoading && (
              <div className="flex flex-col items-center text-light-text">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>{t.generating}</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="text-center text-red-400">
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && !imageUrl && (
              <div className="text-center text-secondary">
                <i className="ph-duotone ph-image text-8xl"></i>
                <p>Your generated image will appear here.</p>
              </div>
            )}
            {imageUrl && (
              <img src={imageUrl} alt={prompt} className="max-w-full max-h-full object-contain rounded-md" />
            )}
          </div>

          {/* Chat Panel */}
          <div className="md:col-span-4 flex flex-col bg-secondary/30 rounded-lg border border-secondary/50 overflow-hidden h-full">
            <header className="p-3 border-b border-secondary/50 flex-shrink-0">
                <h3 className="font-bold text-dark-text text-center">{t.agentTitle}</h3>
            </header>
            <div className="flex-1 p-3 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                    <div className="bg-secondary text-light-text rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                        <span className="h-2 w-2 bg-accent rounded-full animate-pulse delay-75"></span>
                        <span className="h-2 w-2 bg-accent rounded-full animate-pulse delay-150"></span>
                        <span className="h-2 w-2 bg-accent rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-secondary/50 flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  className="bg-accent text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
                  disabled={isChatLoading || !chatInputValue.trim()}
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImageGeneratorModal;