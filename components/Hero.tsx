
import React from 'react';

interface HeroProps {
  t: {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
  };
}

const Hero: React.FC<HeroProps> = ({ t }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 bg-primary overflow-hidden">
       <div className="absolute inset-0 bg-grid-secondary/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
       <div className="absolute -top-40 -left-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-accent/10 rounded-full blur-3xl animate-blob-spin"></div>
       <div className="absolute -bottom-40 -right-40 w-96 h-96 md:w-[600px] md:h-[600px] bg-secondary/20 rounded-full blur-3xl animate-blob-spin animation-delay-3000"></div>


      <div className="container mx-auto px-6 text-center z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold text-dark-text tracking-tighter mb-4 animate-float">
          {t.title}
        </h2>
        <p className="text-xl md:text-2xl font-medium text-accent mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
          {t.subtitle}
        </p>
        <p className="max-w-3xl mx-auto text-lg text-light-text mb-10 animate-float" style={{ animationDelay: '0.4s' }}>
          {t.description}
        </p>
        <a href="#apps" className="inline-block px-10 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
          {t.cta}
        </a>
      </div>
    </section>
  );
};

export default Hero;