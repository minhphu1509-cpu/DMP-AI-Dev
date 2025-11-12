
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAboutModal: () => void;
  t: {
    features: string;
    apps: string;
    pricing: string;
    affiliate: string;
    about: string;
    login: string;
    signup: string;
  };
}

const LanguageSwitcher: React.FC<{
  currentLang: Language;
  onChange: (lang: Language) => void;
}> = ({ currentLang, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' },
    { code: 'vi', name: 'VI' },
    { code: 'zh', name: 'ZH' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-10 border border-secondary rounded-md text-sm font-medium text-light-text hover:bg-secondary transition-colors"
      >
        {currentLang.toUpperCase()}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-secondary rounded-md shadow-lg py-1 z-20">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-light-text hover:bg-primary transition-colors"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, onOpenAboutModal, t }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-primary/80 backdrop-blur-sm transition-shadow duration-300 ${isScrolled ? 'shadow-lg shadow-black/20' : ''}`}>
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-dark-text tracking-wider">
          DMP <span className="text-accent">AI</span> Studio
        </a>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-light-text hover:text-accent transition-colors">{t.features}</a>
          <a href="#apps" className="text-light-text hover:text-accent transition-colors">{t.apps}</a>
          <a href="#pricing" className="text-light-text hover:text-accent transition-colors">{t.pricing}</a>
          <a href="#affiliate" className="text-light-text hover:text-accent transition-colors">{t.affiliate}</a>
          <button onClick={onOpenAboutModal} className="text-light-text hover:text-accent transition-colors">{t.about}</button>
        </nav>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher currentLang={language} onChange={onLanguageChange} />
          <button className="hidden sm:block px-4 py-2 border border-secondary rounded-md text-sm font-medium text-light-text hover:bg-secondary transition-colors">
            {t.login}
          </button>
          <button className="px-4 py-2 bg-accent rounded-md text-sm font-medium text-white hover:bg-orange-700 transition-colors">
            {t.signup}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;