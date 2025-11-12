import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppInfo, Message, Language } from '../types';
import { sendMessageToAgent } from '../services/geminiService';

interface SpecializedChatModalProps {
  app: AppInfo;
  onClose: () => void;
  onProceedToPayment: (app: AppInfo) => void;
  t: {
    agentFor: string;
    welcomeMessage: string;
    proceedToPayment: string;
  };
  language: Language;
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

const SpecializedChatModal: React.FC<SpecializedChatModalProps> = ({ app, onClose, onProceedToPayment, t }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t.welcomeMessage, sender: 'ai' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
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

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToAgent(inputValue, app);
    
    const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);

  }, [inputValue, isLoading, app]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-2xl h-[90vh] max-h-[700px] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-secondary flex-shrink-0">
            <div className="flex items-center">
                <span className="text-3xl mr-3">{app.icon}</span>
                <div>
                    <h2 className="text-lg font-bold text-dark-text">{app.name}</h2>
                    <p className="text-sm text-light-text">{t.agentFor} {app.name}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-light-text text-3xl leading-none hover:text-white">&times;</button>
        </header>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
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

        <footer className="p-4 border-t border-secondary space-y-3">
            <button
                onClick={() => onProceedToPayment(app)}
                className="w-full px-6 py-3 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105"
            >
                {t.proceedToPayment} ({app.price})
            </button>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
                />
                <button
                type="submit"
                className="bg-accent text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                >
                <SendIcon />
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default SpecializedChatModal;
