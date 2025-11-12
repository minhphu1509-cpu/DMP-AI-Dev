
import React from 'react';

interface FooterProps {
  onOpenAboutModal: () => void;
  t: {
    copy: string;
    social: string;
    backToTop: string;
    about: string;
  };
}

const SocialIcon: React.FC<{ href: string, iconClass: string }> = ({ href, iconClass }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors">
        <i className={`ph-fill ph-${iconClass} text-2xl`}></i>
    </a>
)

const Footer: React.FC<FooterProps> = ({ onOpenAboutModal, t }) => {
  return (
    <footer className="bg-primary border-t border-secondary">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-secondary text-center md:text-left">{t.copy}</p>
            <div className="flex flex-col items-center gap-3">
                <p className="font-semibold text-light-text">{t.social}</p>
                <div className="flex space-x-6">
                    <SocialIcon href="#" iconClass="facebook-logo" />
                    <SocialIcon href="#" iconClass="twitter-logo" />
                    <SocialIcon href="#" iconClass="linkedin-logo" />
                    <SocialIcon href="#" iconClass="youtube-logo" />
                </div>
                <button onClick={onOpenAboutModal} className="mt-2 text-light-text hover:text-accent transition-colors text-sm">{t.about}</button>
            </div>
            <a href="#" className="px-4 py-2 border border-secondary rounded-md text-sm font-medium text-light-text hover:bg-secondary transition-colors">
                {t.backToTop} <i className="ph ph-arrow-up ml-1"></i>
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;