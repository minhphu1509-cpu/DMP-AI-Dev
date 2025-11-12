
import React from 'react';
import { FeatureItem } from '../types';

interface FeaturesProps {
  t: {
    title: string;
    items: FeatureItem[];
  };
}

const FeatureCard: React.FC<{ item: FeatureItem }> = ({ item }) => {
  const Icon = React.createElement('i', { className: `ph-duotone ph-${item.icon} text-4xl text-accent` });
  return (
    <div className="bg-secondary/20 p-6 rounded-lg border border-secondary/30 transform hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center mb-3">
            {Icon}
            <h3 className="ml-4 text-xl font-bold text-dark-text">{item.title}</h3>
        </div>
      <p className="text-light-text">{item.description}</p>
    </div>
  );
}

const Features: React.FC<FeaturesProps> = ({ t }) => {
  return (
    <section id="features" className="py-20 sm:py-28 bg-primary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-text">{t.title}</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.items.map((feature, index) => (
            <FeatureCard key={index} item={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;