

import React from 'react';

interface AffiliateProps {
  onOpenDashboard: () => void;
  t: {
    title: string;
    description: string;
    cta: string;
  };
}

const Affiliate: React.FC<AffiliateProps> = ({ onOpenDashboard, t }) => {
  return (
    <section id="affiliate" className="py-20 sm:py-28 bg-secondary/20 relative overflow-hidden">
       <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4">
         <div className="w-96 h-96 border-4 border-accent/20 rounded-full"></div>
       </div>
       <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
         <div className="w-[500px] h-[500px] border-4 border-accent/20 rounded-full"></div>
       </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-6">{t.title}</h2>
        <p className="max-w-3xl mx-auto text-lg text-light-text mb-10">
          {t.description}
        </p>
        <button
          onClick={onOpenDashboard}
          className="px-10 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105"
        >
          {t.cta}
        </button>
      </div>
    </section>
  );
};

export default Affiliate;