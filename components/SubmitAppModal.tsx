// FIX: Create the SubmitAppModal component.
import React, { useEffect, useState } from 'react';
import { SubmittedAppInfo } from '../types';

interface SubmitAppModalProps {
  onClose: () => void;
  onAppSubmit: (data: SubmittedAppInfo) => void;
  t: {
    title: string;
    name: string;
    description: string;
    embedUrl: string;
    pricingModel: string;
    oneTimeFee: string;
    subscription: string;
    price: string;
    submit: string;
    close: string;
    submitSuccess: string;
  };
}

const SubmitAppModal: React.FC<SubmitAppModalProps> = ({ onClose, onAppSubmit, t }) => {
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [pricingModel, setPricingModel] = useState<'one-time' | 'subscription' | null>(null);
  const [price, setPrice] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);


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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !pricingModel) return;

    onAppSubmit({
        name: appName,
        description: appDesc,
        embed_url: appUrl,
        model: pricingModel,
        price: price,
    });
    
    setIsSubmitted(true);
    
    setTimeout(() => {
        onClose();
    }, 2500);
  };
  
  const isFormValid = () => {
    return appName && appDesc && appUrl && pricingModel && price && Number(price) >= 0;
  }

  if (isSubmitted) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-lg flex flex-col p-8 items-center text-center" >
                <svg className="w-16 h-16 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-dark-text mb-2">{t.title}</h2>
                <p className="text-light-text">{t.submitSuccess}</p>
            </div>
        </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-lg flex flex-col p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-text">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-light-text text-3xl leading-none hover:text-white"
            aria-label={t.close}
          >
            &times;
          </button>
        </header>
        <main>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-light-text mb-1">{t.name}</label>
              <input type="text" id="appName" value={appName} onChange={e => setAppName(e.target.value)} required className="w-full bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label htmlFor="appDesc" className="block text-sm font-medium text-light-text mb-1">{t.description}</label>
              <textarea id="appDesc" value={appDesc} onChange={e => setAppDesc(e.target.value)} required rows={3} className="w-full bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label htmlFor="appUrl" className="block text-sm font-medium text-light-text mb-1">{t.embedUrl}</label>
              <input type="url" id="appUrl" value={appUrl} onChange={e => setAppUrl(e.target.value)} required className="w-full bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>

            <div className="border-t border-secondary pt-4">
                <label className="block text-sm font-medium text-light-text mb-2">{t.pricingModel}</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPricingModel('one-time')} className={`p-2 rounded-lg border-2 transition-colors ${pricingModel === 'one-time' ? 'bg-accent border-accent text-white' : 'bg-secondary border-secondary hover:border-accent/50 text-light-text'}`}>
                        {t.oneTimeFee}
                    </button>
                    <button type="button" onClick={() => setPricingModel('subscription')} className={`p-2 rounded-lg border-2 transition-colors ${pricingModel === 'subscription' ? 'bg-accent border-accent text-white' : 'bg-secondary border-secondary hover:border-accent/50 text-light-text'}`}>
                        {t.subscription}
                    </button>
                </div>
            </div>

            {pricingModel && (
                 <div>
                    <label htmlFor="appPrice" className="block text-sm font-medium text-light-text mb-1">{t.price}</label>
                    <input type="number" id="appPrice" value={price} onChange={e => setPrice(e.target.value)} required min="0" placeholder="e.g., 99000" className="w-full bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-accent" />
                 </div>
            )}
            
            <div className="flex justify-end pt-4">
                 <button type="submit" disabled={!isFormValid()} className="px-6 py-2 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105 disabled:bg-secondary disabled:cursor-not-allowed disabled:scale-100">
                    {t.submit}
                </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default SubmitAppModal;