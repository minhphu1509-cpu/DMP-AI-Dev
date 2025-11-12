import React, { useEffect, useState, useCallback } from 'react';
import { AffiliateSale } from '../types';

interface AffiliateDashboardModalProps {
  onClose: () => void;
  sales: AffiliateSale[];
  t: {
    title: string;
    yourLink: string;
    copy: string;
    copied: string;
    performance: string;
    clicks: string;
    sales: string;
    commission: string;
    recentSales: string;
    date: string;
    product: string;
    payoutSummary: string;
    balance: string;
    requestPayout: string;
    close: string;
  };
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-secondary/50 p-4 rounded-lg flex items-center">
        <div className="p-3 bg-secondary rounded-md mr-4">
           {icon}
        </div>
        <div>
            <p className="text-sm text-light-text">{title}</p>
            <p className="text-2xl font-bold text-dark-text">{value}</p>
        </div>
    </div>
);


const AffiliateDashboardModal: React.FC<AffiliateDashboardModalProps> = ({ onClose, sales, t }) => {
  const affiliateLink = 'https://dmpaistudio.web.app?ref=user123';
  const [copyButtonText, setCopyButtonText] = useState(t.copy);
  
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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(affiliateLink).then(() => {
        setCopyButtonText(t.copied);
        setTimeout(() => setCopyButtonText(t.copy), 2000);
    });
  }, [affiliateLink, t.copy, t.copied]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-primary border border-secondary rounded-xl shadow-2xl w-11/12 max-w-4xl flex flex-col p-6 max-h-[90vh]"
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
        <main className="overflow-y-auto pr-2 space-y-6">
            {/* Affiliate Link */}
            <div className="bg-secondary/30 p-4 rounded-lg">
                <label className="block text-sm font-medium text-light-text mb-2">{t.yourLink}</label>
                <div className="flex space-x-2">
                    <input type="text" readOnly value={affiliateLink} className="w-full bg-secondary border border-secondary/50 rounded-lg px-4 py-2 text-light-text focus:outline-none" />
                    <button onClick={handleCopy} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${copyButtonText === t.copied ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-orange-700'}`}>
                        {copyButtonText}
                    </button>
                </div>
            </div>

            {/* Performance */}
            <div>
                <h3 className="text-lg font-semibold text-dark-text mb-3">{t.performance}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title={t.clicks} value="1,428" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>} />
                    <StatCard title={t.sales} value={sales.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" /></svg>} />
                    <StatCard title={t.commission} value="1,194,000 VND" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                </div>
            </div>

            {/* Recent Sales Table */}
            <div>
                 <h3 className="text-lg font-semibold text-dark-text mb-3">{t.recentSales}</h3>
                 <div className="bg-secondary/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-light-text uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t.date}</th>
                                    <th scope="col" className="px-6 py-3">{t.product}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t.commission}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="border-b border-secondary/50">
                                        <td className="px-6 py-4 text-dark-text">{sale.date}</td>
                                        <td className="px-6 py-4 text-dark-text">{sale.product}</td>
                                        <td className="px-6 py-4 text-green-400 font-medium text-right">{sale.commission}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* Payout Summary */}
             <div>
                 <h3 className="text-lg font-semibold text-dark-text mb-3">{t.payoutSummary}</h3>
                 <div className="bg-secondary/30 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between">
                     <div>
                        <p className="text-light-text">{t.balance}</p>
                        <p className="text-3xl font-bold text-accent">2,450,500 VND</p>
                     </div>
                     <button className="w-full md:w-auto mt-4 md:mt-0 px-6 py-3 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
                        {t.requestPayout}
                     </button>
                 </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AffiliateDashboardModal;