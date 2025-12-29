
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { Search, Bell, Sun, Moon, MapPin, Map as MapIcon, Sparkles, X, ArrowRight, Heart, Filter, User, Settings, CreditCard, Shield, Globe, LogOut, ChevronRight, SlidersHorizontal, Image, Briefcase, Utensils, List, Ticket, BookOpen, Compass, Mic, PenTool, Wrench, Plane, Train, Bus, Mail, PackageCheck, Coffee, Camera, Headphones, Wallet, Trophy, Bike, Loader2, Menu, ChevronLeft, ScanEye, ArrowUpDown, Clock, Zap, Tag, History, TrendingUp, Hotel } from 'lucide-react';
import Navbar from './components/Navbar';
import AIModal from './components/AIModal';
import BookingCard from './components/BookingCard';
import TripPlanner from './components/TripPlanner';
import WeatherWidget from './components/WeatherWidget';
import ServiceDetailModal from './components/ServiceDetailModal';
import NotificationPanel from './components/NotificationPanel';
import LuggageChecklist from './components/LuggageChecklist';
import FoodGuide from './components/FoodGuide';
import SmartGuideModal from './components/SmartGuideModal';
import UtilitiesPanel from './components/UtilitiesPanel';
import CulinaryCultureModal from './components/CulinaryCultureModal';
import MoodSelector from './components/MoodSelector';
import Toast from './components/Toast';
import ChillPlacesModal from './components/ChillPlacesModal';
import TravelWallet from './components/TravelWallet';
import NearbyEssentials from './components/NearbyEssentials';
import Explore from './components/Explore';
import MainMenu from './components/MainMenu';
import WelcomeScreen from './components/WelcomeScreen';
import SmartToolsModal from './components/SmartToolsModal';
import AdvancedFilterModal, { FilterState } from './components/AdvancedFilterModal';
import MapView from './components/MapView';
import MyBookingsView from './components/MyBookingsView';
import CalendarWidget from './components/CalendarWidget';
import SearchInsight from './components/SearchInsight';
import VoiceOverlay from './components/VoiceOverlay';

// Lazy Load Heavy Components for Performance (Core Web Vitals)
const SonicVietnam = lazy(() => import('./components/SonicVietnam'));
const PostcardMaker = lazy(() => import('./components/PostcardMaker'));
const CheckInChallenge = lazy(() => import('./components/CheckInChallenge'));
const MotorbikeGuide = lazy(() => import('./components/MotorbikeGuide'));

import { LOCATIONS, POPULAR_HOTELS, POPULAR_TOURS, RENTAL_CARS, FLIGHTS, TRAINS, BUSES, NOTIFICATIONS as DEFAULT_NOTIFICATIONS } from './constants';
import { ServiceItem, ToastMessage, Booking, UserProfile, Notification, SearchAnalysis } from './types';
import { db } from './services/db';
import { parseSmartSearch, analyzeSearchContext } from './services/geminiService';
import { translations, Language } from './services/translations';

// Loading Fallback
const LoadingFallback = () => (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('vi'); // Default Language
  
  // Modals & Tools
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isCulinaryOpen, setIsCulinaryOpen] = useState(false);
  const [isSonicOpen, setIsSonicOpen] = useState(false);
  const [isPostcardOpen, setIsPostcardOpen] = useState(false);
  const [isSmartToolsOpen, setIsSmartToolsOpen] = useState(false);
  
  // Tool Modals 
  const [isLuggageOpen, setIsLuggageOpen] = useState(false);
  const [isFoodGuideOpen, setIsFoodGuideOpen] = useState(false);
  const [isChillPlacesOpen, setIsChillPlacesOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isMotorbikeOpen, setIsMotorbikeOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isBookingsViewOpen, setIsBookingsViewOpen] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<'all' | 'hotel' | 'tour' | 'car' | 'flight' | 'train' | 'bus'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<ServiceItem[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  
  // UI States
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [tooltipData, setTooltipData] = useState<{x: number, y: number, text: string} | null>(null);
  
  // Scroll Navigation State
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Guide State
  const [guideLocation, setGuideLocation] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ServiceItem[] | null>(null);
  const [searchInsight, setSearchInsight] = useState<SearchAnalysis | null>(null);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  
  // Enhanced Search State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Đà Nẵng', 'Homestay Đà Lạt', 'Vé máy bay Hà Nội']);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Advanced Filter State
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
      amenities: [],
      propertyType: [],
      priceRange: [0, 1000],
      freeCancellation: false,
      minRating: 0
  });
  const [sortBy, setSortBy] = useState<'priceLow' | 'priceHigh' | 'ratingHigh' | 'ratingLow' | 'deal'>('deal');
  
  // Pagination State
  const [visibleItemsCount, setVisibleItemsCount] = useState(6);
  
  // Updated scrollRef type to HTMLDivElement to fix ref assignment error on line 830
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = translations[lang]; 
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Search Placeholders
  const searchPlaceholders = [
      t.searchPlaceholder,
      lang === 'vi' ? "Tìm 'Homestay Đà Lạt view đẹp'..." : "Search 'Dalat homestay with view'...",
      lang === 'vi' ? "Tìm 'Vé máy bay đi Phú Quốc'..." : "Search 'Flights to Phu Quoc'...",
      lang === 'vi' ? "Tìm 'Ăn gì ngon ở Hội An'..." : "Search 'Best food in Hoi An'...",
      lang === 'vi' ? "Lên lịch trình 3 ngày 2 đêm..." : "Plan a 3-day 2-night trip...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  // Click outside search to close dropdown
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setIsSearchFocused(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  // Categories with Translation
  const CATEGORIES = [
    { id: 'all', label: t.categories.all },
    { id: 'flight', label: t.categories.flight, icon: Plane },
    { id: 'hotel', label: t.categories.hotel, icon: Hotel },
    { id: 'train', label: t.categories.train, icon: Train },
    { id: 'bus', label: t.categories.bus, icon: Bus },
    { id: 'tour', label: t.categories.tour, icon: Compass },
    { id: 'car', label: t.categories.car, icon: SlidersHorizontal },
  ];

  // --- Push Notification Simulation ---
  useEffect(() => {
      // Simulate a flash sale notification after 8 seconds
      const timer1 = setTimeout(() => {
          const newNotif: Notification = {
              id: `push-${Date.now()}`,
              title: '🔥 Vé 0 đồng VietJet!',
              message: 'Săn vé 0đ khung giờ vàng 12h-14h hôm nay. Số lượng có hạn!',
              type: 'alert',
              time: 'Vừa xong',
              read: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          addToast(newNotif.title, 'info'); // Show toast as push banner
      }, 8000);

      // Simulate a weather alert after 20 seconds
      const timer2 = setTimeout(() => {
          const newNotif: Notification = {
              id: `push-weather-${Date.now()}`,
              title: '☔ Dự báo thời tiết Đà Lạt',
              message: 'Cuối tuần này Đà Lạt có mưa phùn và lạnh (14°C). Nhớ mang áo ấm nhé!',
              type: 'info',
              time: 'Vừa xong',
              read: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          addToast('Tin nhắn mới từ Trợ lý Thời tiết', 'info');
      }, 20000);

      return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
      };
  }, []);

  const handleMarkAllRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  useEffect(() => {
    const initApp = async () => {
        try {
            const settings = await db.getSettings();
            if (settings) {
                setDarkMode(settings.darkMode);
                setLang(settings.language as Language || 'vi');
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setDarkMode(prefersDark);
            }

            const user = await db.getUser('current');
            if (user) {
                setUserProfile(user);
            } else {
                const defaultUser: UserProfile = {
                    id: 'current',
                    name: 'Guest',
                    email: 'user@example.com',
                    avatar: 'https://picsum.photos/seed/user/200/200',
                    language: 'vi',
                    points: 100,
                    rank: 'Member'
                };
                await db.saveUser(defaultUser);
                setUserProfile(defaultUser);
            }
        } catch (error) {
            console.error("Init DB error", error);
        }
    };
    initApp();
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        // Small buffer of 10px to avoid precision issues
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Handle Horizontal Scroll with Mouse Wheel
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
        const onWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            // Prevent vertical scroll only if horizontal scroll is possible
            if (el.scrollWidth > el.clientWidth) {
                e.preventDefault();
                // Adjusted sensitivity: 2.5 for faster scrolling
                el.scrollLeft += e.deltaY * 2.5;
                requestAnimationFrame(checkScroll);
            }
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        checkScroll(); // Initial check
        window.addEventListener('resize', checkScroll);
        
        return () => {
            el.removeEventListener('wheel', onWheel);
            window.removeEventListener('resize', checkScroll);
        };
    }
  }, []);

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const scrollAmount = scrollRef.current.clientWidth * 0.7; // Scroll 70% of view width
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
        // Check scroll state after animation (approximate)
        setTimeout(checkScroll, 500);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      db.saveSettings({ id: 'settings', darkMode: newMode, language: lang });
  };

  const toggleLanguage = () => {
      const newLang = lang === 'vi' ? 'en' : 'vi';
      setLang(newLang);
      db.saveSettings({ id: 'settings', darkMode: darkMode, language: newLang });
      addToast(`Language changed to ${newLang === 'en' ? 'English' : 'Vietnamese'}`, 'success');
  };

  useEffect(() => {
    setVisibleItemsCount(6); // Reset pagination on cat change
    setSelectedTag(null); // Reset tag filter on cat change
  }, [currentCategory]);

  useEffect(() => {
    if (activeTab === 'ai-assistant') {
      setIsAIModalOpen(true);
    }
    if (activeTab === 'trips') {
      loadFavorites();
    }
    if (activeTab === 'profile') {
        loadBookings();
    }
    const refreshUser = async () => {
        const u = await db.getUser('current');
        if(u) setUserProfile(u);
    };
    if (activeTab === 'profile' || !isChallengeOpen) {
        refreshUser();
    }
  }, [activeTab, isChallengeOpen]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadFavorites = async () => {
    const favs = await db.getFavorites();
    setFavorites(favs);
  };

  const loadBookings = async () => {
      const bookings = await db.getBookings();
      setMyBookings(bookings);
  };

  const allItems = [...FLIGHTS, ...POPULAR_HOTELS, ...TRAINS, ...BUSES, ...POPULAR_TOURS, ...RENTAL_CARS];

  // Derive available tags based on current category
  const itemsForTags = currentCategory === 'all' ? allItems : allItems.filter(i => i.type === currentCategory);
  const availableTags = Array.from(new Set(itemsForTags.flatMap(i => i.tags || []))).sort();

  const handleVoiceResult = (text: string) => {
      setIsVoiceOverlayOpen(false);
      setSearchQuery(text);
      handleSmartSearch(text);
  };

  const handleSmartSearch = async (queryOverride?: string) => {
    const query = queryOverride !== undefined ? queryOverride : searchQuery;
    if (!query.trim()) {
        setSearchResults(null);
        setSearchInsight(null);
        return;
    }
    
    // Save to history
    setRecentSearches(prev => {
        const newHistory = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return newHistory;
    });

    setIsSearching(true);
    setIsSearchFocused(false);
    setSearchInsight(null); // Reset insight

    // 1. Filter local items using enhanced NLP criteria
    const criteria = await parseSmartSearch(query);
    let results = allItems;

    if (criteria) {
        if (criteria.location) {
            results = results.filter(item => item.location.toLowerCase().includes(criteria.location.toLowerCase()));
        }
        if (criteria.maxPrice) {
            results = results.filter(item => item.price <= criteria.maxPrice);
        }
        if (criteria.type && criteria.type !== 'all') {
            results = results.filter(item => item.type === criteria.type);
            setCurrentCategory(criteria.type as any); // Sync category
        }
        // Extracting and matching amenities from extracted criteria
        if (criteria.amenities && criteria.amenities.length > 0) {
            results = results.filter(item => 
                item.amenities && criteria.amenities.every((a: string) => 
                    item.amenities!.some(ia => ia.toLowerCase().includes(a.toLowerCase()))
                )
            );
        }
        // Matching guests if hotel
        if (criteria.guests && criteria.type === 'hotel') {
            results = results.filter(item => 
                item.roomTypes?.some(rt => rt.maxGuests >= criteria.guests!)
            );
        }
    }
    setSearchResults(results);

    // 2. Generate AI Insight based on results context
    const topResultName = results.length > 0 ? results[0].name : undefined;
    const insight = await analyzeSearchContext(query, results.length, topResultName, lang);
    if(insight) setSearchInsight(insight);

    setIsSearching(false);
    if(results.length === 0 && !insight) {
        addToast(t.noResult, 'info');
    }
  };

  const sortItems = (items: ServiceItem[]) => {
      return [...items].sort((a, b) => {
          switch (sortBy) {
              case 'priceLow': return a.price - b.price;
              case 'priceHigh': return b.price - a.price;
              case 'ratingHigh': return b.rating - a.rating;
              case 'ratingLow': return a.rating - b.rating;
              case 'deal':
                  const discountA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
                  const discountB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
                  return discountB - discountA;
              default: return 0;
          }
      });
  };

  const getFilteredItems = () => {
    let items = searchResults || allItems;
    
    // Category Filter
    if (currentCategory !== 'all') items = items.filter(item => item.type === currentCategory);
    
    // Tag Filter
    if (selectedTag) {
        items = items.filter(item => item.tags?.includes(selectedTag));
    }

    // Advanced Filters
    // Price
    items = items.filter(item => item.price >= advancedFilters.priceRange[0] && item.price <= advancedFilters.priceRange[1]);
    
    // Rating
    if (advancedFilters.minRating > 0) {
        items = items.filter(item => item.rating >= advancedFilters.minRating);
    }

    // Free Cancellation
    if (advancedFilters.freeCancellation) {
        items = items.filter(item => item.cancellationPolicy === 'free');
    }

    // Amenities (Check if item has ALL selected amenities)
    if (advancedFilters.amenities.length > 0) {
        items = items.filter(item => {
            if (!item.amenities) return false;
            // Simplified check: Check if amenity string contains filter keyword
            return advancedFilters.amenities.every(filter => 
                item.amenities!.some(amenity => amenity.toLowerCase().includes(filter.toLowerCase()))
            );
        });
    }

    return sortItems(items);
  };

  const displayedItems = getFilteredItems().slice(0, visibleItemsCount);
  const totalFilteredCount = getFilteredItems().length;

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        text
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  // Flash Sale Timer Logic for Header
  const FlashSaleHeader = () => {
      const [timeLeft, setTimeLeft] = useState({h: 12, m: 30, s: 45});
      
      useEffect(() => {
          const timer = setInterval(() => {
              setTimeLeft(prev => {
                  let {h, m, s} = prev;
                  if (s > 0) s--;
                  else {
                      s = 59;
                      if (m > 0) m--;
                      else {
                          m = 59;
                          if (h > 0) h--;
                          else clearInterval(timer);
                      }
                  }
                  return {h, m, s};
              });
          }, 1000);
          return () => clearInterval(timer);
      }, []);

      return (
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-4 md:p-6 mb-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="flex items-center gap-4 relative z-10 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                      <h3 className="font-black text-xl md:text-2xl uppercase tracking-wider">{t.flashSale.title}</h3>
                      <p className="text-white/80 text-sm">Up to 50% OFF</p>
                  </div>
              </div>
              <div className="flex gap-2 items-center relative z-10">
                  <span className="text-sm font-bold uppercase tracking-wider opacity-90 mr-2">{t.flashSale.endIn}:</span>
                  {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
                      <div key={i} className="bg-white text-red-600 font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                          {unit.toString().padStart(2, '0')}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-x-hidden selection:bg-blue-500/30">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {activeTab !== 'explore' && !isBookingsViewOpen && (
      <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-4 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMainMenuOpen(true)}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-800 dark:text-white backdrop-blur-md"
            >
                <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                    AI
                </div>
                <h1 className="text-lg font-bold tracking-tight hidden sm:block text-slate-900 dark:text-slate-100">DMP Travel Hub</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
             <button 
                onClick={toggleLanguage}
                className="p-2.5 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-600 dark:text-slate-300 backdrop-blur-md font-bold text-xs"
            >
                {lang === 'vi' ? 'VI' : 'EN'}
            </button>
            <button 
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-600 dark:text-slate-300 backdrop-blur-md"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2.5 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all text-slate-600 dark:text-slate-300 backdrop-blur-md relative"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
                    )}
                </button>
                <NotificationPanel 
                    isOpen={isNotifOpen} 
                    onClose={() => setIsNotifOpen(false)} 
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                />
            </div>
            
            <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <img src={userProfile?.avatar || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" alt="User" />
            </button>
        </div>
      </header>
      )}

      <main className={`${activeTab !== 'explore' && !isBookingsViewOpen ? 'pt-24 md:pt-28' : ''} px-4 max-w-7xl mx-auto space-y-8 md:space-y-12`}>
        
        {activeTab === 'home' && (
            <>
                <CalendarWidget />
                
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-slideUp">
                    <div className="lg:col-span-2 relative rounded-[32px] md:rounded-[40px] overflow-visible min-h-[350px] md:min-h-[400px] flex flex-col justify-end p-6 md:p-8 shadow-2xl shadow-blue-900/10 group bg-gray-900 border border-white/10">
                        {/* Background Image Container with Overflow Hidden */}
                        <div className="absolute inset-0 rounded-[32px] md:rounded-[40px] overflow-hidden">
                            <img 
                                src="https://picsum.photos/seed/travelai/1600/900" 
                                alt="Hero" 
                                className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>
                        
                        <div className="relative z-10 w-full max-w-2xl space-y-4">
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                                {t.welcome} <br/><span className="text-blue-400">{t.withAI}</span> 
                            </h1>
                            <p className="text-slate-200 text-sm md:text-lg font-medium drop-shadow-md line-clamp-2 md:line-clamp-none">{t.subtitle}</p>

                            {/* Enhanced Search Bar */}
                            <div ref={searchRef} className="relative z-50">
                                <div className={`mt-4 bg-white/95 dark:bg-[#1C1C1E]/90 backdrop-blur-xl p-2 rounded-[28px] shadow-2xl flex items-center gap-2 w-full border border-white/20 transition-all duration-300 ${isSearchFocused ? 'ring-4 ring-blue-500/20 scale-[1.02]' : ''}`}>
                                    {/* Search Icon / Sparkles */}
                                    <div className="pl-3 md:pl-4">
                                        <Sparkles className={`w-5 h-5 ${isSearchFocused ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
                                    </div>
                                    
                                    {/* Input */}
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                                        placeholder={searchPlaceholders[placeholderIndex]}
                                        className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400/80 py-3 text-sm md:text-base min-w-0 transition-all" 
                                    />

                                    {/* Clear Button */}
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); setSearchResults(null); setSearchInsight(null); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Voice Button */}
                                    <button 
                                        onClick={() => setIsVoiceOverlayOpen(true)}
                                        className="p-3 rounded-xl transition-all text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400"
                                        title="Voice Search"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Search Button */}
                                    <button 
                                        onClick={() => handleSmartSearch()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] px-6 py-3 font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 shrink-0"
                                    >
                                        {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                                        <span className="hidden md:inline">{t.searchBtn}</span>
                                    </button>
                                </div>

                                {/* Voice Overlay */}
                                <VoiceOverlay 
                                    isOpen={isVoiceOverlayOpen} 
                                    onClose={() => setIsVoiceOverlayOpen(false)}
                                    onResult={handleVoiceResult}
                                    lang={lang}
                                />

                                {/* Search Dropdown */}
                                {isSearchFocused && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-slideDown p-2">
                                        
                                        {/* Recent Searches */}
                                        {recentSearches.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <History className="w-3 h-3" /> {lang === 'vi' ? 'Gần đây' : 'Recent'}
                                                </div>
                                                {recentSearches.map((term, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => { setSearchQuery(term); handleSmartSearch(term); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                                                    >
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Trending Suggestions */}
                                        <div>
                                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3" /> {lang === 'vi' ? 'Xu hướng' : 'Trending'}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 p-2">
                                                {[
                                                    { name: 'Đà Nẵng', type: 'City' },
                                                    { name: 'Phú Quốc', type: 'Island' },
                                                    { name: 'Sapa', type: 'Mountain' },
                                                    { name: 'Hội An', type: 'Old Town' }
                                                ].map((item, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => { setSearchQuery(item.name); handleSmartSearch(item.name); }}
                                                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-blue-500 shadow-sm">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                                                            <p className="text-[10px] text-gray-500">{item.type}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <WeatherWidget />
                        
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setIsTripPlannerOpen(true)}
                                onMouseEnter={(e) => handleMouseEnter(e, "AI lập lịch trình chi tiết trong 30s")}
                                onMouseLeave={handleMouseLeave}
                                className="group relative bg-white dark:bg-[#1C1C1E] hover:bg-indigo-50 dark:hover:bg-[#2C2C2E] rounded-[32px] p-4 sm:p-5 flex flex-col justify-between transition-all border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <MapIcon className="w-5 h-5" />
                                </div>
                                <div className="text-left mt-4">
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AI Plan</span>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{t.planTrip}</h3>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setIsSmartToolsOpen(true)}
                                onMouseEnter={(e) => handleMouseEnter(e, "Săn vé rẻ, Soi Homestay, Mẹo vặt")}
                                onMouseLeave={handleMouseLeave}
                                className="group relative bg-white dark:bg-[#1C1C1E] hover:bg-red-50 dark:hover:bg-[#2C2C2E] rounded-[32px] p-4 sm:p-5 flex flex-col justify-between transition-all border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                    <ScanEye className="w-5 h-5" />
                                </div>
                                <div className="text-left mt-4">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Smart Tools</span>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Radar & Scan</h3>
                                </div>
                            </button>

                             <button 
                                onClick={() => setIsLuggageOpen(true)}
                                onMouseEnter={(e) => handleMouseEnter(e, "Danh sách đồ cần mang theo chuẩn AI")}
                                onMouseLeave={handleMouseLeave}
                                className="group relative bg-white dark:bg-[#1C1C1E] hover:bg-teal-50 dark:hover:bg-[#2C2C2E] rounded-[32px] p-4 sm:p-5 flex flex-col justify-between transition-all border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                                    <PackageCheck className="w-5 h-5" />
                                </div>
                                <div className="text-left mt-4">
                                    <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">Checklist</span>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{t.luggage}</h3>
                                </div>
                            </button>

                            <button 
                                onClick={() => setIsUtilitiesOpen(true)}
                                onMouseEnter={(e) => handleMouseEnter(e, "Dịch thuật, Đổi tiền, Sửa ảnh, SOS")}
                                onMouseLeave={handleMouseLeave}
                                className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[32px] p-4 sm:p-5 flex flex-col justify-between transition-all shadow-lg shadow-purple-500/30 hover:scale-[1.02]"
                            >
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                    <Wrench className="w-6 h-6" />
                                </div>
                                <div className="text-left mt-2">
                                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block mb-1">Tools & Studio</span>
                                    <h3 className="text-lg font-bold text-white leading-tight">{t.utilities}</h3>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>
                
                <section>
                    <MoodSelector />
                </section>

                <section className="relative group -mx-4 px-4">
                    {/* Left Scroll Navigation */}
                    {canScrollLeft && (
                        <>
                            <div className="absolute left-0 top-0 bottom-10 w-24 bg-gradient-to-r from-[#F2F4F8] dark:from-[#09090b] to-transparent z-10 pointer-events-none transition-opacity duration-300" />
                            <button 
                                onClick={() => scrollManual('left')} 
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/50 p-3 rounded-full shadow-lg backdrop-blur-sm hover:scale-110 transition-all border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white hidden md:flex"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Right Scroll Navigation */}
                    {canScrollRight && (
                        <>
                            <div className="absolute right-0 top-0 bottom-10 w-24 bg-gradient-to-l from-[#F2F4F8] dark:from-[#09090b] to-transparent z-10 pointer-events-none transition-opacity duration-300" />
                            <button 
                                onClick={() => scrollManual('right')} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/50 p-3 rounded-full shadow-lg backdrop-blur-sm hover:scale-110 transition-all border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white hidden md:flex"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    <div 
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-4 overflow-x-auto no-scrollbar pb-10 pt-6 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
                    >
                        <button 
                            onClick={() => setIsChallengeOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Thử thách chụp ảnh hàng ngày nhận XP")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-transform min-w-[200px]"
                        >
                            <Trophy className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.challenge}</span>
                            <div className="absolute -top-1 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        </button>
                        
                        <button 
                            onClick={() => setIsMotorbikeOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Lộ trình & hành trang cho Phượt thủ")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-transform min-w-[200px]"
                        >
                            <Bike className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.moto}</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsSonicOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Âm thanh đặc trưng từng vùng miền")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-gradient-to-r from-gray-800 to-black text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-transform min-w-[200px]"
                        >
                            <Headphones className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.sonic}</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsPostcardOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Tự thiết kế bưu thiếp gửi người thân")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-transform min-w-[200px]"
                        >
                            <Mail className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.postcard}</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsCulinaryOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Khám phá câu chuyện văn hóa ẩm thực")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-transform min-w-[200px]"
                        >
                            <Utensils className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.food}</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsFoodGuideOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Lên lịch trình ăn uống trong ngày")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 px-6 py-4 rounded-2xl shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-[200px]"
                        >
                            <Coffee className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.foodTour}</span>
                        </button>
                        
                        <button 
                            onClick={() => setIsChillPlacesOpen(true)} 
                            onMouseEnter={(e) => handleMouseEnter(e, "Tìm góc sống ảo theo tâm trạng")}
                            onMouseLeave={handleMouseLeave}
                            className="snap-center group relative flex items-center gap-3 bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 px-6 py-4 rounded-2xl shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-[200px]"
                        >
                            <Camera className="w-6 h-6" />
                            <span className="font-bold text-lg">{t.buttons.chill}</span>
                        </button>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.trending}</h2>
                        <button className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            {t.viewAll} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {LOCATIONS.map(loc => (
                            <div key={loc.id} className="group relative h-48 md:h-64 rounded-[28px] md:rounded-[32px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-white/5">
                                <img src={loc.image} alt={loc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-base md:text-lg font-bold text-white mb-1">{loc.name}</h3>
                                    <p className="text-xs text-white/70 line-clamp-1 mb-3 font-medium hidden md:block">{loc.description}</p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setGuideLocation(loc.name); }}
                                        className="w-full py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/30 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-3 h-3" /> <span className="hidden md:inline">AI Guide</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="listings" className="pt-4">
                    <FlashSaleHeader />
                    
                    {/* Search Insight Component */}
                    {searchInsight && (
                        <SearchInsight insight={searchInsight} onClose={() => setSearchInsight(null)} />
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                         <div className="text-center sm:text-left">
                             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.goodDeal}</h2>
                             <p className="text-sm text-slate-500 dark:text-slate-400">{t.aiSuggest}</p>
                         </div>
                        <div className="flex gap-2 items-center">
                             {/* Sorting Dropdown */}
                             <div className="relative group/sort">
                                 <button className="p-3 rounded-full bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                     <ArrowUpDown className="w-4 h-4" />
                                     <span className="text-sm font-bold hidden sm:inline">{t.sort}</span>
                                 </button>
                                 <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#252528] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden hidden group-hover/sort:block z-50 animate-slideDown">
                                     {['priceLow', 'priceHigh', 'ratingHigh', 'ratingLow', 'deal'].map(opt => (
                                         <button 
                                            key={opt}
                                            onClick={() => setSortBy(opt as any)}
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${sortBy === opt ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                         >
                                             {t.sortOptions[opt as keyof typeof t.sortOptions]}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <button 
                                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                                className="p-3 rounded-full bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                {viewMode === 'list' ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => setIsAdvancedFilterOpen(true)}
                              className={`p-3 rounded-full transition-all flex items-center gap-2 px-5 border ${advancedFilters.amenities.length > 0 || advancedFilters.freeCancellation || advancedFilters.minRating > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-[#1C1C1E] border-gray-100 dark:border-white/5 text-slate-700 dark:text-slate-200'}`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span className="text-sm font-bold">{t.filter}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar py-2">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon || MapIcon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCurrentCategory(cat.id as any)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap flex items-center gap-2 ${
                                        currentCategory === cat.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {cat.icon && <Icon className="w-4 h-4" />}
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Tag Filters */}
                    {availableTags.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1 ${
                                    !selectedTag 
                                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white' 
                                    : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <Tag className="w-3 h-3" />
                                All Tags
                            </button>
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                                        selectedTag === tag 
                                        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white' 
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    <AdvancedFilterModal 
                        isOpen={isAdvancedFilterOpen} 
                        onClose={() => setIsAdvancedFilterOpen(false)}
                        onApply={setAdvancedFilters}
                    />

                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
                            {displayedItems.length > 0 ? (
                                <>
                                    {displayedItems.map(item => (
                                        <BookingCard 
                                            key={item.id} 
                                            item={item} 
                                            onClick={() => setSelectedItem(item)}
                                            onFavoriteChange={() => {
                                                loadFavorites();
                                                addToast(favorites.some(f => f.id === item.id) ? t.bookingCard.removedFav : t.bookingCard.addedFav, 'success');
                                            }}
                                            lang={lang}
                                        />
                                    ))}
                                    
                                    {/* Load More Button */}
                                    {visibleItemsCount < totalFilteredCount && (
                                        <div className="col-span-full text-center mt-4">
                                            <button 
                                                onClick={() => setVisibleItemsCount(prev => prev + 6)}
                                                className="px-8 py-3 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-full font-bold text-slate-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
                                            >
                                                {t.loadMore}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/5">
                                        <Search className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noResult}</p>
                                    <button onClick={() => {
                                        setAdvancedFilters({
                                            amenities: [],
                                            propertyType: [],
                                            priceRange: [0, 1000],
                                            freeCancellation: false,
                                            minRating: 0
                                        }); 
                                        setSearchQuery(''); 
                                        setSearchResults(null);
                                        setSearchInsight(null);
                                        setSelectedTag(null);
                                    }} className="mt-4 text-blue-600 hover:underline">{t.clearFilter}</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                             <MapView 
                                items={getFilteredItems()}
                                onItemClick={(item) => setSelectedItem(item)}
                             />
                        </div>
                    )}
                </section>
            </>
        )}

        {activeTab === 'explore' && (
            <Explore addToast={addToast} />
        )}

        {activeTab === 'wallet' && (
            <div className="animate-fadeIn max-w-2xl mx-auto pb-24 h-[calc(100vh-140px)]">
                 <TravelWallet onClose={() => setActiveTab('home')} lang={lang} />
            </div>
        )}

        {activeTab === 'trips' && (
             <div className="min-h-[60vh] animate-fadeIn pb-20 pt-10">
                <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                        <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.navbar.trips}</h2>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-dashed border-gray-300 dark:border-gray-700">
                        <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">No favorites yet</h3>
                        <button 
                            onClick={() => setActiveTab('home')}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Explore now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favorites.map(item => (
                            <BookingCard 
                                key={item.id} 
                                item={item} 
                                onFavoriteChange={loadFavorites}
                                onClick={() => setSelectedItem(item)}
                                lang={lang}
                            />
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'profile' && (
            isBookingsViewOpen ? (
                <MyBookingsView 
                    bookings={myBookings} 
                    onClose={() => setIsBookingsViewOpen(false)} 
                    onRefresh={loadBookings} 
                />
            ) : (
            <div className="animate-fadeIn max-w-2xl mx-auto pb-24 pt-10">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 relative p-1 border-2 border-blue-500 shadow-lg">
                        <img src={userProfile?.avatar || "https://picsum.photos/seed/user/200/200"} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userProfile?.name || 'Bạn'}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{userProfile?.email}</p>
                    
                    <div className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-yellow-200 dark:border-yellow-500/20">
                        <Sparkles className="w-3 h-3" />
                        {userProfile?.rank || 'Member'}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-blue-500/30 relative overflow-hidden border border-white/10">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium opacity-90">{t.profile.xpPoints}</span>
                            <span className="font-bold text-lg">{userProfile?.points || 0} XP</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                            <div className="bg-yellow-400 h-2 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${Math.min(((userProfile?.points || 0) / 3000) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* My Bookings Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">{t.profile.myBookings}</h3>
                        <button 
                            onClick={() => setIsBookingsViewOpen(true)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            Xem tất cả
                        </button>
                    </div>
                    {myBookings.length > 0 ? (
                        <div className="space-y-4">
                            {myBookings.slice(0, 3).map(booking => (
                                <div key={booking.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                                        <img src={booking.image} className="w-full h-full object-cover" alt="Service" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{booking.itemName}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>{booking.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <Ticket className="w-3 h-3" />
                                            #{booking.id}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-400">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">${Math.round(booking.totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                            <p className="text-sm text-gray-500">Chưa có đặt chỗ nào</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider ml-2">{t.profile.settings}</h3>
                    
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                         <button onClick={toggleLanguage} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                <Globe className="w-4 h-4" />
                            </div>
                            <span className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100">{t.profile.language} ({lang === 'vi' ? 'Tiếng Việt' : 'English'})</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <button 
                        onClick={() => addToast(t.profile.loggedOut, 'info')}
                        className="w-full p-4 mt-6 text-red-500 font-medium bg-white dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center gap-2 border border-gray-100 dark:border-white/5 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> {t.profile.logout}
                    </button>
                </div>
            </div>
            )
        )}

      </main>

      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'ai-assistant') {
            setIsAIModalOpen(true);
        } else {
            setActiveTab(tab);
            // Reset Booking view when switching tabs
            if(tab !== 'profile') setIsBookingsViewOpen(false);
        }
      }} lang={lang} />
      
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => {
            setIsAIModalOpen(false);
            if(activeTab === 'ai-assistant') setActiveTab('home');
        }} 
        lang={lang} 
        context={{
            activeTab,
            selectedItem
        }}
      />
      
      <MainMenu isOpen={isMainMenuOpen} onClose={() => setIsMainMenuOpen(false)} lang={lang} />

      {isTripPlannerOpen && (
        <TripPlanner onClose={() => setIsTripPlannerOpen(false)} lang={lang} />
      )}
      
      {isSmartToolsOpen && (
          <SmartToolsModal onClose={() => setIsSmartToolsOpen(false)} lang={lang} />
      )}

      {selectedItem && (
        <ServiceDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            addToast={addToast}
            lang={lang}
        />
      )}

      {guideLocation && (
        <SmartGuideModal 
            location={guideLocation} 
            onClose={() => setGuideLocation(null)}
        />
      )}

      {isCulinaryOpen && (
          <CulinaryCultureModal onClose={() => setIsCulinaryOpen(false)} />
      )}

      {/* Lazy Loaded Components with Suspense */}
      <Suspense fallback={<LoadingFallback />}>
          {isSonicOpen && (
              <SonicVietnam onClose={() => setIsSonicOpen(false)} />
          )}

          {isPostcardOpen && (
              <PostcardMaker onClose={() => setIsPostcardOpen(false)} />
          )}
          
          {isChallengeOpen && (
            <CheckInChallenge onClose={() => setIsChallengeOpen(false)} addToast={addToast} />
          )}

          {isMotorbikeOpen && (
            <MotorbikeGuide onClose={() => setIsMotorbikeOpen(false)} />
          )}
      </Suspense>
      
      <UtilitiesPanel isOpen={isUtilitiesOpen} onClose={() => setIsUtilitiesOpen(false)} />
      
      {isLuggageOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl h-[80vh] relative">
                <button onClick={() => setIsLuggageOpen(false)} className="absolute -top-12 right-0 text-white p-2 hover:text-gray-300 transition-colors">Close</button>
                <LuggageChecklist />
            </div>
         </div>
      )}
      
      {isFoodGuideOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl h-[80vh] relative">
                <button onClick={() => setIsFoodGuideOpen(false)} className="absolute -top-12 right-0 text-white p-2 hover:text-gray-300 transition-colors">Close</button>
                <FoodGuide />
            </div>
         </div>
      )}
      
      {isChillPlacesOpen && (
          <ChillPlacesModal onClose={() => setIsChillPlacesOpen(false)} />
      )}

      {tooltipData && (
          <div 
              className="fixed z-[100] px-3 py-2 bg-gray-900/95 text-white text-xs font-medium rounded-lg shadow-xl backdrop-blur-sm border border-white/10 pointer-events-none transition-opacity duration-200 animate-fadeIn whitespace-nowrap"
              style={{ 
                  left: tooltipData.x, 
                  top: tooltipData.y, 
                  transform: 'translate(-50%, -100%)' 
              }}
          >
              {tooltipData.text}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
          </div>
      )}

    </div>
  );
}

export default App;
