import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  SUPPORTED_CURRENCIES,
  FALLBACK_RATES,
  symbolToCode,
  codeToSymbol,
  fetchExchangeRates,
  convertCurrency,
  formatCurrencyValue
} from '../services/currencyService';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const { user } = useAuth();

  const [rates, setRates] = useState(FALLBACK_RATES);
  const [isFallback, setIsFallback] = useState(false);
  const [loadingRates, setLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  // Account Base Currency (currency of stored database records). Defaults to INR.
  const [baseCurrency] = useState(() => {
    const savedBase = localStorage.getItem('fintrack_base_currency');
    if (savedBase) return symbolToCode(savedBase);
    return 'INR';
  });

  useEffect(() => {
    if (user?.currency_symbol && !localStorage.getItem('fintrack_base_currency')) {
      const code = symbolToCode(user.currency_symbol);
      localStorage.setItem('fintrack_base_currency', code);
    }
  }, [user?.currency_symbol]);

  const baseSymbol = codeToSymbol(baseCurrency);

  // Display currency chosen by user, stored in localStorage
  const [displayCurrency, setDisplayCurrencyState] = useState(() => {
    const saved = localStorage.getItem('fintrack_display_currency');
    if (saved) return symbolToCode(saved);
    return 'INR';
  });

  const loadRates = useCallback(async () => {
    try {
      setLoadingRates(true);
      const res = await fetchExchangeRates();
      setRates(res.rates || FALLBACK_RATES);
      setIsFallback(!!res.isFallback);
      setRatesError(null);
    } catch (err) {
      setRatesError(err.message);
      setIsFallback(true);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const setDisplayCurrency = useCallback((codeOrSymbol) => {
    const code = symbolToCode(codeOrSymbol);
    setDisplayCurrencyState(code);
    localStorage.setItem('fintrack_display_currency', code);
  }, []);

  const convert = useCallback((amount, fromCurrency = baseCurrency, toCurrency = displayCurrency) => {
    return convertCurrency(amount, fromCurrency, toCurrency, rates);
  }, [baseCurrency, displayCurrency, rates]);

  const format = useCallback((amount, fromCurrency = baseCurrency, toCurrency = displayCurrency, options = {}) => {
    const converted = convert(amount, fromCurrency, toCurrency);
    return formatCurrencyValue(converted, toCurrency, options);
  }, [convert, baseCurrency, displayCurrency]);


  const formatRaw = useCallback((amount, currency = displayCurrency, options = {}) => {
    return formatCurrencyValue(amount, currency, options);
  }, [displayCurrency]);

  const displaySymbol = codeToSymbol(displayCurrency);

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        displaySymbol,
        baseCurrency,
        baseSymbol,
        setDisplayCurrency,
        convert,
        format,
        formatRaw,
        rates,
        isFallback,
        loadingRates,
        ratesError,
        refreshRates: loadRates,
        SUPPORTED_CURRENCIES
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
