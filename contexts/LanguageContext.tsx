import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  bn: {
    // Navigation
    home: 'খবর',
    saved: 'সংরক্ষিত',
    security: 'নিরাপত্তা',
    settings: 'সেটিংস',
    
    // Home Screen
    brandTitle: 'Bug Mohol',
    brandSubtitle: 'সাইবার নিরাপত্তার সর্বশেষ খবর',
    searchPlaceholder: 'খবর খুঁজুন...',
    featured: 'ফিচার্ড',
    trending: 'ট্রেন্ডিং',
    latestNews: 'সর্বশেষ খবর',
    live: 'লাইভ',
    readersOnline: 'পাঠক অনলাইন',
    newsCount: 'টি খবর',
    
    // Categories
    all: 'সব',
    hacking: 'হ্যাকিং',
    malware: 'ম্যালওয়্যার',
    phishing: 'ফিশিং',
    ransomware: 'র‍্যানসমওয়্যার',
    cyberAttack: 'সাইবার আক্রমণ',
    dataBreach: 'ডেটা ব্রিচ',
    
    // Time
    justNow: 'এখনই',
    hoursAgo: 'ঘন্টা আগে',
    daysAgo: 'দিন আগে',
    
    // Actions
    share: 'শেয়ার',
    save: 'সংরক্ষণ',
    readFull: 'সম্পূর্ণ খবর পড়ুন',
    retry: 'আবার চেষ্টা করুন',
    contactSupport: 'সাপোর্ট যোগাযোগ',
    
    // Settings
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    systemMode: 'সিস্টেম মোড',
    language: 'ভাষা',
    bengali: 'বাংলা',
    english: 'English',
    notifications: 'নোটিফিকেশন',
    autoDownload: 'অটো ডাউনলোড',
    clearCache: 'ক্যাশ পরিষ্কার করুন',
    clearSaved: 'সংরক্ষিত খবর মুছুন',
    about: 'Bug Mohol সম্পর্কে',
    privacyPolicy: 'গোপনীয়তা নীতি',
    
    // Messages
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    noSavedArticles: 'কোনো সংরক্ষিত খবর নেই',
    articleSaved: 'খবরটি সংরক্ষণ করা হয়েছে',
    articleRemoved: 'খবরটি সংরক্ষিত তালিকা থেকে সরানো হয়েছে',
    
    // Security Tips
    securityTitle: 'সাইবার নিরাপত্তা',
    securitySubtitle: 'আপনার ডিজিটাল জীবনকে সুরক্ষিত রাখুন',
  },
  en: {
    // Navigation
    home: 'News',
    saved: 'Saved',
    security: 'Security',
    settings: 'Settings',
    
    // Home Screen
    brandTitle: 'Bug Mohol',
    brandSubtitle: 'Latest Cybersecurity News',
    searchPlaceholder: 'Search news...',
    featured: 'Featured',
    trending: 'Trending',
    latestNews: 'Latest News',
    live: 'Live',
    readersOnline: 'readers online',
    newsCount: 'news',
    
    // Categories
    all: 'All',
    hacking: 'Hacking',
    malware: 'Malware',
    phishing: 'Phishing',
    ransomware: 'Ransomware',
    cyberAttack: 'Cyber Attack',
    dataBreach: 'Data Breach',
    
    // Time
    justNow: 'Just now',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    
    // Actions
    share: 'Share',
    save: 'Save',
    readFull: 'Read Full Article',
    retry: 'Try Again',
    contactSupport: 'Contact Support',
    
    // Settings
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    systemMode: 'System Mode',
    language: 'Language',
    bengali: 'বাংলা',
    english: 'English',
    notifications: 'Notifications',
    autoDownload: 'Auto Download',
    clearCache: 'Clear Cache',
    clearSaved: 'Clear Saved Articles',
    about: 'About Bug Mohol',
    privacyPolicy: 'Privacy Policy',
    
    // Messages
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noSavedArticles: 'No saved articles',
    articleSaved: 'Article saved successfully',
    articleRemoved: 'Article removed from saved list',
    
    // Security Tips
    securityTitle: 'Cybersecurity',
    securitySubtitle: 'Keep your digital life secure',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['bn', 'en'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['bn']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}