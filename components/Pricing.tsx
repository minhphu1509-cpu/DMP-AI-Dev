import React from 'react';
import { Plan } from '../types';

interface PricingProps {
  t: {
    title: string;
    plans: Plan[];
  };
  onSelectPlan: (plan: Plan) => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const PricingCard: React.FC<{
  plan: Plan;
  onSelect: (plan: Plan) => void;
}> = ({ plan, onSelect }) => (
  <div className={`relative border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ${plan.recommended ? 'bg-secondary border-accent scale-105' : 'bg-secondary/50 border-secondary'}`}>
    {plan.recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold">POPULAR</div>
    )}
    <h3 className="text-2xl font-semibold text-dark-text mb-4">{plan.name}</h3>
    <div className="mb-6">
      <span className="text-5xl font-extrabold text-white">{plan.price}</span>
      <span className="text-lg font-medium text-light-text ml-1">{plan.unit}</span>
    </div>
    <ul className="space-y-3 text-left mb-8 flex-grow">
        {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
                <CheckIcon />
                <span className="ml-3 text-light-text">{feature}</span>
            </li>
        ))}
    </ul>
    <button 
      onClick={() => onSelect(plan)}
      className={`w-full py-3 font-bold rounded-lg mt-auto transition-colors ${plan.recommended ? 'bg-accent text-white hover:bg-orange-700' : 'bg-primary text-light-text hover:bg-secondary'}`}>
      {plan.cta}
    </button>
  </div>
);

const Pricing: React.FC<PricingProps> = ({ t, onSelectPlan }) => {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-primary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-text">{t.title}</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {t.plans.map(plan => (
                <PricingCard key={plan.name} plan={plan} onSelect={onSelectPlan} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;