import React, { useEffect } from 'react';

interface AboutModalProps {
  onClose: () => void;
  t: {
    title: string;
    content: string;
    close: string;
  };
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose, t }) => {
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-2xl flex flex-col p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-6">
          <h2 id="about-modal-title" className="text-2xl font-bold text-dark-text">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-light-text text-3xl leading-none hover:text-white"
            aria-label={t.close}
          >
            &times;
          </button>
        </header>
        <main className="text-light-text leading-relaxed">
          <p dangerouslySetInnerHTML={{ __html: t.content }}></p>
        </main>
        <footer className="mt-8 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-secondary text-light-text font-bold rounded-lg hover:bg-secondary/70 transition-colors"
            >
                {t.close}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default AboutModal;