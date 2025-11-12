import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { sendMessageToAgent } from '../services/geminiService';

interface ChatWidgetProps {
  t: {
    welcomeMessage: string;
    agentName: string;
    placeholder: string;
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
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
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


const ChatWidget: React.FC<ChatWidgetProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const getInitialMessages = (): Message[] => {
      try {
        const savedMessages = sessionStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [{ id: 1, text: t.welcomeMessage, sender: 'ai' }];
      } catch (error) {
        return [{ id: 1, text: t.welcomeMessage, sender: 'ai' }];
      }
  };
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Save messages to session storage whenever they change
    try {
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
        console.error("Could not save chat messages to session storage.", error);
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length <= 1) { // Only reset if it's a fresh session
        setMessages([{ id: 1, text: t.welcomeMessage, sender: 'ai' }]);
    }
  }, [isOpen, t.welcomeMessage]);

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

    const aiResponseText = await sendMessageToAgent(inputValue);
    
    const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);

  }, [inputValue, isLoading]);

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-accent text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-orange-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent"
          aria-label="Open chat widget"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-ping-slow"></span>
          <i className="ph-fill ph-sparkle text-4xl relative"></i>
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-full sm:w-[400px] sm:h-[600px] z-50 bg-primary border-secondary sm:border rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <div className="bg-secondary p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
          <div>
            <h3 className="font-bold text-dark-text">{t.agentName}</h3>
            <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <p className="text-xs text-light-text">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-light-text hover:text-white text-3xl">&times;</button>
        </div>

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

        <div className="p-4 border-t border-secondary">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
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
        </div>
      </div>
    </>
  );
};

export default ChatWidget;