// FIX: Create the DeveloperZone component.
import React from 'react';

interface DeveloperZoneProps {
  onOpenSubmitModal: () => void;
  t: {
    title: string;
    description: string;
    cta: string;
  };
}

const CodeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
)

const DeveloperZone: React.FC<DeveloperZoneProps> = ({ onOpenSubmitModal, t }) => {
  return (
    <section id="developer-zone" className="py-20 sm:py-28 bg-primary relative overflow-hidden">
      <CodeIcon className="absolute -top-10 -left-10 w-48 h-48 text-secondary/30" />
      <CodeIcon className="absolute -bottom-16 -right-16 w-64 h-64 text-secondary/30 transform rotate-45" />
      <div className="container mx-auto px-6 text-center relative">
        <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-6">{t.title}</h2>
        <p className="max-w-3xl mx-auto text-lg text-light-text mb-10">
          {t.description}
        </p>
        <button
          onClick={onOpenSubmitModal}
          className="px-10 py-4 bg-transparent border-2 border-accent text-accent font-bold rounded-lg shadow-lg hover:bg-accent hover:text-white transition-all transform hover:scale-105"
        >
          {t.cta}
        </button>
      </div>
    </section>
  );
};

export default DeveloperZone;