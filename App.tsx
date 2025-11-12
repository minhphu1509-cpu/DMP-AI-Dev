// FIX: Implement the main App component to structure the application.
import React, { useState, useCallback } from 'react';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Apps from './components/Apps';
import Pricing from './components/Pricing';
import Affiliate from './components/Affiliate';
import DeveloperZone from './components/DeveloperZone';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import SubmitAppModal from './components/SubmitAppModal';
import PaymentModal from './components/PaymentModal';
import AffiliateDashboardModal from './components/AffiliateDashboardModal';
import SpecializedChatModal from './components/SpecializedChatModal';
import AboutModal from './components/AboutModal';
import ImageGeneratorModal from './components/ImageGeneratorModal';


import { Language, AppInfo, Plan, SubmittedAppInfo, PurchaseableItem, AffiliateSale } from './types';
import { TRANSLATIONS, APPS_DATA } from './constants';

const initialAffiliateSales: AffiliateSale[] = [
    { id: 1, date: '2024-07-20', product: 'Pro Plan', commission: '29,850 VND' },
    { id: 2, date: '2024-07-19', product: 'Basic Plan', commission: '14,850 VND' },
];

function App() {
  const [language, setLanguage] = useState<Language>('vi');
  const [apps, setApps] = useState<AppInfo[]>(APPS_DATA);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [itemToPurchase, setItemToPurchase] = useState<PurchaseableItem | null>(null);
  const [isAffiliateDashboardOpen, setIsAffiliateDashboardOpen] = useState(false);
  const [specializedChatApp, setSpecializedChatApp] = useState<AppInfo | null>(null);
  const [imageGeneratorApp, setImageGeneratorApp] = useState<AppInfo | null>(null);
  const [affiliateSales, setAffiliateSales] = useState<AffiliateSale[]>(initialAffiliateSales);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);
  
  const handleAppSelect = useCallback((app: AppInfo) => {
    if (app.category === 'Image Generation') {
        setImageGeneratorApp(app);
        return;
    }
    if (app.isUnlocked) {
      window.open(app.embed_url, '_blank', 'noopener,noreferrer');
    } else {
      setSpecializedChatApp(app);
    }
  }, []);

  const handleOpenPaymentModal = (item: PurchaseableItem) => {
    if ((item as Plan).cta === 'Contact Us' || (item as Plan).cta === 'Liên hệ' || (item as Plan).cta === '联系我们') {
        window.location.href = 'mailto:sales@dmpaistudio.com';
        return;
    }
    setItemToPurchase(item);
  };
  
  const handleProceedToPayment = useCallback((app: AppInfo) => {
    setSpecializedChatApp(null);
    handleOpenPaymentModal(app);
  }, []);

  const handlePaymentSuccess = useCallback((item: PurchaseableItem, affiliateCode: string) => {
    console.log(`Payment success for ${item.name} with code: ${affiliateCode}`);
    
    // Unlock app if an app was purchased
    if ('embed_url' in item) { // Type guard for AppInfo
        setApps(prevApps => prevApps.map(app => 
            app.id === item.id ? { ...app, isUnlocked: true } : app
        ));
    }
    
    // Add to affiliate sales if code is valid
    if (affiliateCode.toLowerCase() === 'user123') {
        const newSale: AffiliateSale = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            product: item.name,
            commission: '15,000 VND' // Mock commission
        };
        setAffiliateSales(prevSales => [newSale, ...prevSales]);
    }
    
  }, []);


  const handleAppSubmit = useCallback((data: SubmittedAppInfo) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(Number(data.price));
    const priceSuffix = data.model === 'subscription' ? 'VND/mo' : 'VND';

    const appToAdd: AppInfo = {
        id: `dev-app-${Date.now()}`,
        icon: '🚀',
        name: data.name,
        description: data.description,
        embed_url: data.embed_url,
        price: `${formattedPrice} ${priceSuffix}`,
        category: 'Productivity',
        isUnlocked: false,
    };
    setApps(prevApps => [...prevApps, appToAdd]);
  }, []);

  const t = TRANSLATIONS[language];

  return (
    <div className="bg-primary min-h-screen font-sans">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        t={t.header}
      />
      <main>
        <Hero t={t.hero} />
        <Features t={t.features} />
        <Apps apps={apps} onAppSelect={handleAppSelect} t={t.apps} />
        <Pricing onSelectPlan={handleOpenPaymentModal} t={t.pricing} />
        <Affiliate onOpenDashboard={() => setIsAffiliateDashboardOpen(true)} t={t.affiliate} />
        <DeveloperZone onOpenSubmitModal={() => setIsSubmitModalOpen(true)} t={t.developerZone} />
      </main>
      <Footer onOpenAboutModal={() => setIsAboutModalOpen(true)} t={t.footer} />
      <ChatWidget t={t.chatWidget} />
       {specializedChatApp && (
        <SpecializedChatModal
          app={specializedChatApp}
          onClose={() => setSpecializedChatApp(null)}
          onProceedToPayment={handleProceedToPayment}
          t={t.specializedChat}
          language={language}
        />
      )}
      {imageGeneratorApp && (
          <ImageGeneratorModal
            app={imageGeneratorApp}
            onClose={() => setImageGeneratorApp(null)}
            t={t.imageGeneratorModal}
          />
      )}
      {isSubmitModalOpen && (
        <SubmitAppModal
            onClose={() => setIsSubmitModalOpen(false)}
            onAppSubmit={handleAppSubmit}
            t={t.submitAppModal}
        />
      )}
      {itemToPurchase && (
        <PaymentModal
          item={itemToPurchase}
          onClose={() => setItemToPurchase(null)}
          onPaymentSuccess={handlePaymentSuccess}
          t={t.paymentModal}
        />
      )}
      {isAffiliateDashboardOpen && (
        <AffiliateDashboardModal
          onClose={() => setIsAffiliateDashboardOpen(false)}
          sales={affiliateSales}
          t={t.affiliateDashboard}
        />
      )}
      {isAboutModalOpen && (
        <AboutModal
          onClose={() => setIsAboutModalOpen(false)}
          t={t.aboutModal}
        />
      )}
    </div>
  );
}

export default App;