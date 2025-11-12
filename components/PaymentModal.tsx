import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { PurchaseableItem, Plan } from '../types';

interface PaymentModalProps {
  item: PurchaseableItem;
  onClose: () => void;
  onPaymentSuccess: (item: PurchaseableItem, affiliateCode: string) => void;
  t: {
    title: string;
    processing: string;
    success: string;
    affiliateCode: string;
    affiliatePlaceholder: string;
    youSelected: string;
    bankTransfer: string;
    momoWallet: string;
    paypal: string;
    creditCard: string;
    accountNumber: string;
    accountHolder: string;
    bankName: string;
    transferContent: string;
    scanQR: string;
    paymentConfirmation: string;
    copy: string;
    copied: string;
    momoPhoneNumber: string;
    paypalEmail: string;
  };
}

type PaymentTab = 'bank' | 'momo' | 'paypal' | 'card';

const bankInfo = {
    accNumber: '554646686868',
    accName: 'DONG MINH PHU',
    bank: 'Techcombank',
    bin: '970407',
};
const momoInfo = {
    phone: '0766771509'
};
const paypalInfo = {
    email: 'minhphu1509@gmail.com'
};

const InfoRow: React.FC<{ label: string; value: string; canCopy?: boolean; t: { copy: string, copied: string } }> = ({ label, value, canCopy, t }) => {
    const [copyText, setCopyText] = useState(t.copy);
    
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value).then(() => {
            setCopyText(t.copied);
            setTimeout(() => setCopyText(t.copy), 2000);
        });
    }, [value, t.copy, t.copied]);

    return (
        <div className="flex justify-between items-center py-2 border-b border-secondary/50">
            <span className="text-sm text-light-text">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-dark-text">{value}</span>
                {canCopy && (
                    <button onClick={handleCopy} className={`text-xs px-2 py-0.5 rounded-md ${copyText === t.copied ? 'bg-green-500 text-white' : 'bg-secondary hover:bg-secondary/70 text-light-text'}`}>
                        {copyText}
                    </button>
                )}
            </div>
        </div>
    );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ item, onClose, onPaymentSuccess, t }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [activeTab, setActiveTab] = useState<PaymentTab>('bank');
  
  const orderId = useMemo(() => `DMP${Date.now()}`, []);

  const qrCodeUrl = useMemo(() => 
    `https://img.vietqr.io/image/${bankInfo.bin}-${bankInfo.accNumber}-compact2.png?amount=0&addInfo=${orderId}&accountName=${encodeURIComponent(bankInfo.accName)}`,
    [orderId]
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const handlePayment = () => {
    setStatus('processing');
    setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
            onPaymentSuccess(item, affiliateCode);
            onClose();
        }, 1500);
    }, 2000);
  };
  
  const isPlan = (item: PurchaseableItem): item is Plan => (item as Plan).unit !== undefined;
  
  const itemName = item.name;
  const itemPrice = isPlan(item) ? `${item.price} ${item.unit}` : item.price;

  const renderContent = () => {
    if (status === 'processing') return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-light-text text-lg">{t.processing}</p>
        </div>
    );
    
    if (status === 'success') return (
       <div className="flex flex-col items-center justify-center h-64">
          <svg className="w-16 h-16 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-dark-text text-xl font-bold">{t.success}</p>
        </div>
    );
    
    const tabs: { id: PaymentTab; label: string; icon: string }[] = [
        { id: 'bank', label: t.bankTransfer, icon: 'bank' },
        { id: 'momo', label: t.momoWallet, icon: 'cellphone' },
        { id: 'paypal', label: t.paypal, icon: 'paypal-logo' },
        { id: 'card', label: t.creditCard, icon: 'credit-card' },
    ];
    
    return (
        <>
            <div className="text-center mb-4">
                <p className="text-sm text-light-text">{t.youSelected}</p>
                <h3 className="text-2xl font-bold text-dark-text">{itemName}</h3>
                <p className="text-xl font-semibold text-accent mt-1">{itemPrice}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="affiliateCode" className="block text-xs font-medium text-light-text mb-1">{t.affiliateCode}</label>
              <input type="text" id="affiliateCode" value={affiliateCode} onChange={e => setAffiliateCode(e.target.value)} placeholder={t.affiliatePlaceholder} className="w-full bg-secondary border border-secondary/50 rounded-lg px-3 py-2 text-sm text-light-text focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            
            <div className="flex border-b border-secondary mb-4">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 text-sm py-2 px-1 text-center border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-accent font-semibold' : 'border-transparent text-light-text hover:text-white'}`}>
                        <i className={`ph-fill ph-${tab.icon} mr-1`}></i> {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                {activeTab === 'bank' && (
                    <div className="text-center space-y-4">
                        <p className="text-light-text text-sm">{t.scanQR}</p>
                        <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg w-48 h-48 bg-white p-2" />
                        <div className="text-left">
                           <InfoRow label={t.accountNumber} value={bankInfo.accNumber} canCopy t={t} />
                           <InfoRow label={t.accountHolder} value={bankInfo.accName} canCopy t={t} />
                           <InfoRow label={t.bankName} value={bankInfo.bank} canCopy t={t} />
                           <InfoRow label={t.transferContent} value={orderId} canCopy t={t} />
                        </div>
                        <button onClick={handlePayment} className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">{t.paymentConfirmation}</button>
                    </div>
                )}
                 {activeTab === 'momo' && (
                    <div className="space-y-4">
                        <div className="flex justify-center my-6">
                            <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="#D82D8B"></path><path d="M152.174 100C152.174 128.814 128.814 152.174 100 152.174C71.1864 152.174 47.8261 128.814 47.8261 100C47.8261 71.1864 71.1864 47.8261 100 47.8261C128.814 47.8261 152.174 71.1864 152.174 100ZM79.6739 100C79.6739 111.258 88.7416 120.326 100 120.326C111.258 120.326 120.326 111.258 120.326 100C120.326 88.7416 111.258 79.6739 100 79.6739C88.7416 79.6739 79.6739 88.7416 79.6739 100Z" fill="white"></path></svg>
                        </div>
                        <InfoRow label={t.momoPhoneNumber} value={momoInfo.phone} canCopy t={t} />
                        <InfoRow label={t.transferContent} value={orderId} canCopy t={t} />
                        <button onClick={handlePayment} className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">{t.paymentConfirmation}</button>
                    </div>
                 )}
                 {activeTab === 'paypal' && (
                     <div className="space-y-4">
                        <div className="flex justify-center my-6">
                           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.333 5.03C3.333 4.478 3.78 4.03 4.333 4.03h8.344a.434.434 0 01.432.393l.667 4.257c.05.318.318.55.636.55h1.965c2.47 0 4.472-2.003 4.472-4.473S20.849.333 18.38.333h-8.22c-3.18 0-5.833 2.47-6.015 5.642L3.333 22.3h4.634l.666-4.226.223-1.28c.112-.667.667-1.168 1.334-1.168h1.668c2.89 0 5.33-2.057 5.885-4.885.39-1.945-.722-3.89-2.5-4.558a3.91 3.91 0 00-4.558 1.668l-.5 2.89-.278 1.834c-.11.667-.666 1.167-1.333 1.167H7.773a.465.465 0 01-.445-.556l.334-2.112z" fill="#0070BA"></path></svg>
                        </div>
                        <InfoRow label={t.paypalEmail} value={paypalInfo.email} canCopy t={t} />
                        <InfoRow label={t.transferContent} value={orderId} canCopy t={t} />
                        <button onClick={handlePayment} className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">{t.paymentConfirmation}</button>
                    </div>
                 )}
                 {activeTab === 'card' && (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                       <button onClick={handlePayment} className="w-full flex items-center justify-center p-3 bg-secondary hover:bg-secondary/70 rounded-lg text-light-text font-semibold transition-colors">
                            <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M46.73 14.532c-1.253.28-2.61.42-4.07.42-3.14 0-5.833-1.073-7.98-3.22l-1.39-1.426 1.41-1.404c1.94-1.94 4.553-2.95 7.63-2.95 1.133 0 2.213.14 3.24.42l.533-3.16c-1.346-.35-2.773-.53-4.28-.53-4.32 0-7.92 1.52-10.453 4.558l-2.02 2.03-3.133-3.16C24.42.532 20.486-.51 15.906 1.25c-3.793 1.453-5.293 4.88-3.82 8.358 1.093-1.8 2.893-3.08 5.093-3.793 2.187-.713 4.413-.533 6.36 1.026l8.026 8.013c2.32 2.306 5.346 3.48 8.8 3.48 1.547 0 3.013-.213 4.4-.633L46.73 14.532z" fill="#635BFF"></path><path d="M11.086 22.75c3.793-1.453 5.293-4.88 3.82-8.358-1.093 1.8-2.893 3.08-5.093 3.793-2.187.713-4.413.533-6.36-1.026L.333 9.145c-2.32-2.307-5.346-3.48-8.8-3.48-1.547 0-3.013.213-4.4.633l-1.986 4.306c1.253-.28 2.61-.42 4.07-.42 3.14 0 5.833 1.073 7.98 3.22l1.39 1.426-1.41 1.404c-1.94 1.94-4.553 2.95-7.63 2.95-1.133 0-2.213-.14-3.24-.42l-.533 3.16c1.346.35 2.773.53 4.28.53 4.32 0 7.92-1.52 10.453-4.558l2.02-2.03 3.133 3.16c1.76 1.746 3.96 2.64 6.44 2.64 1.187 0 2.306-.187 3.32-.533L11.086 22.75z" fill="#635BFF"></path></svg>
                       </button>
                    </div>
                 )}
            </div>
        </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
      <div className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-md flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-text">{t.title}</h2>
          <button onClick={onClose} className="text-light-text text-3xl leading-none hover:text-white" aria-label="Close">&times;</button>
        </header>
        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default PaymentModal;