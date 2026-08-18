import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

const translations = { en, hi, es, fr, de };

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('fintrack_language');
    if (saved && translations[saved]) return saved;
    const browserLang = navigator.language?.split('-')[0];
    return translations[browserLang] ? browserLang : 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('fintrack_language', lang);
    }
  };

  const t = (keyPath, params = {}) => {
    const keys = keyPath.split('.');
    let current = translations[language] || translations.en;
    let fallback = translations.en;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        current = null;
        break;
      }
    }

    if (!current) {
      current = fallback;
      for (const key of keys) {
        if (current && current[key] !== undefined) {
          current = current[key];
        } else {
          return keyPath;
        }
      }
    }

    if (typeof current !== 'string') return keyPath;

    // Substitute parameters e.g. {name}, {count}
    return Object.keys(params).reduce((acc, paramKey) => {
      return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    }, current);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
