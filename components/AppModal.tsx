import React, { useEffect, useState } from 'react';
import { AppInfo } from '../types';

interface AppModalProps {
  app: AppInfo;
  onClose: () => void;
  t: {
    unlock: string;
    loading: string;
  };
}

const AppModal: React.FC<AppModalProps> = ({ app, onClose, t }) => {
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 h-[90vh] max-w-6xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-secondary flex-shrink-0">
          <h2 className="text-xl font-bold text-dark-text">{app.name}</h2>
          <button
            onClick={onClose}
            className="text-light-text text-3xl leading-none hover:text-white"
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>
        <main className="flex-grow p-1 md:p-2 bg-black overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-light-text">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mr-3"></div>
                {t.loading}
            </div>
          )}
          <iframe
            src={app.embed_url}
            title={app.name}
            className={`w-full h-full border-0 rounded-md transition-opacity duration-500 ${isLoading ? 'opacity-0': 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            // sandbox="allow-scripts allow-same-origin" // Consider security policies
          ></iframe>
        </main>
        <footer className="p-4 border-t border-secondary flex-shrink-0 flex justify-end items-center">
            <span className="text-light-text mr-4">{app.price}</span>
        </footer>
      </div>
    </div>
  );
};

export default AppModal;