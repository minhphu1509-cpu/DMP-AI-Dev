// FIX: Define and export types to be used across the application.
export type Language = 'en' | 'vi' | 'zh';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  price: string;
  embed_url: string;
  category: 'Content' | 'Automation' | 'Design' | 'Productivity' | 'Image Generation';
  isUnlocked?: boolean;
}

// Data from the developer submission form
export interface SubmittedAppInfo {
    name: string;
    description: string;
    embed_url: string;
    price: string;
    model: 'one-time' | 'subscription';
}

export interface Plan {
  name: string;
  price: string;
  unit: string;
  cta: string;
  recommended: boolean;
  features: string[];
}

export type PurchaseableItem = Plan | AppInfo;

export interface AffiliateSale {
    id: number;
    date: string;
    product: string;
    commission: string;
}

export interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

export interface TranslationSet {
  header: {
    features: string;
    apps: string;
    pricing: string;
    affiliate: string;
    about: string;
    login: string;
    signup: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
  };
  features: {
    title: string;
    items: FeatureItem[];
  };
  apps: {
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
  pricing: {
    title: string;
    plans: Plan[];
  };
  affiliate: {
    title: string;
    description: string;
    cta: string;
  };
  developerZone: {
    title: string;
    description: string;
    cta: string;
  };
  footer: {
    copy: string;
    social: string;
    backToTop: string;
    about: string;
  };
  chatWidget: {
    welcomeMessage: string;
    agentName: string;
    placeholder: string;
  };
  specializedChat: {
    agentFor: string;
    welcomeMessage: string;
    proceedToPayment: string;
  };
  appModal: {
    unlock: string;
    loading: string;
  };
  submitAppModal: {
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
  paymentModal: {
    title: string;
    payWith: string;
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
  affiliateDashboard: {
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
  aboutModal: {
    title: string;
    content: string;
    close: string;
  };
  imageGeneratorModal: {
    title: string;
    promptPlaceholder: string;
    generate: string;
    generating: string;
    error: string;
    close: string;
    saveImage: string;
    saveImageFilenamePrompt: string;
    agentTitle: string;
    welcomeMessage: string;
    chatPlaceholder: string;
  };
}