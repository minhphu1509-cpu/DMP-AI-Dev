// FIX: Create the Apps component to display available AI applications.
import React, { useState, useMemo } from 'react';
import { AppInfo } from '../types';

interface AppCardProps {
  app: AppInfo;
  onSelect: (app: AppInfo) => void;
  style: React.CSSProperties;
}

const AppCard: React.FC<AppCardProps> = ({ app, onSelect, style }) => (
  <div
    className="bg-secondary/50 border border-secondary rounded-lg p-6 flex flex-col items-center text-center hover:bg-secondary hover:border-accent transform hover:-translate-y-1 transition-all duration-300 cursor-pointer opacity-0 animate-fade-in"
    onClick={() => onSelect(app)}
    style={style}
  >
    <div className="text-5xl mb-4">{app.icon}</div>
    <h3 className="text-xl font-bold text-dark-text mb-2">{app.name}</h3>
    <p className="text-light-text flex-grow">{app.description}</p>
  </div>
);

interface AppsProps {
  apps: AppInfo[];
  onAppSelect: (app: AppInfo) => void;
  t: {
    title: string;
    description: string;
    searchPlaceholder: string;
    noAppsFound: string;
    categories: {
        all: string;
        content: string;
        automation: string;
        design: string;
        productivity: string;
        imageGeneration: string;
    };
    sorting: {
        label: string;
        asc: string;
        desc: string;
    };
  };
}

type Category = 'All' | AppInfo['category'];
type SortOrder = 'asc' | 'desc' | '';

const Apps: React.FC<AppsProps> = ({ apps, onAppSelect, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('');

  const categories: { key: Category, name: string }[] = [
    { key: 'All', name: t.categories.all },
    { key: 'Content', name: t.categories.content },
    { key: 'Automation', name: t.categories.automation },
    { key: 'Design', name: t.categories.design },
    { key: 'Productivity', name: t.categories.productivity },
    { key: 'Image Generation', name: t.categories.imageGeneration },
  ];

  const processedApps = useMemo(() => {
    let results = apps.filter(app => {
        const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (sortOrder === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
        results.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return results;

  }, [apps, searchQuery, activeCategory, sortOrder]);

  return (
    <section id="apps" className="py-20 sm:py-28 bg-primary/95 bg-[radial-gradient(#4B4B4B_1px,transparent_1px)] [background-size:2rem_2rem]">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-4">{t.title}</h2>
          <p className="max-w-2xl mx-auto text-lg text-light-text">{t.description}</p>
        </div>

        <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-grow relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-secondary border border-secondary/50 rounded-full px-4 py-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent pl-12"
                    aria-label="Search applications"
                />
            </div>
            <div className="relative w-full sm:w-auto">
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="w-full sm:w-auto bg-secondary border border-secondary/50 rounded-full px-4 py-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent appearance-none pl-4 pr-10"
                    aria-label="Sort applications"
                >
                    <option value="" disabled>{t.sorting.label}</option>
                    <option value="asc">{t.sorting.asc}</option>
                    <option value="desc">{t.sorting.desc}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-12">
            {categories.map(cat => (
                <button 
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeCategory === cat.key ? 'bg-accent text-white' : 'bg-secondary text-light-text hover:bg-secondary/70'}`}
                    title={cat.name}
                >
                    {cat.name}
                </button>
            ))}
        </div>
        
        {processedApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {processedApps.map((app, index) => (
              <AppCard 
                key={app.id} 
                app={app} 
                onSelect={onAppSelect} 
                style={{ animationDelay: `${index * 100}ms`}}
              />
            ))}
          </div>
        ) : (
           <div className="text-center text-light-text text-lg py-16">
            <p>{t.noAppsFound}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Apps;