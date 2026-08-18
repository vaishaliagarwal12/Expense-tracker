export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'ar-AE', decimals: 2 }
];

export const FALLBACK_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155.0,
  AUD: 1.52,
  CAD: 1.36,
  AED: 3.67
};

const CACHE_KEY = 'fintrack_exchange_rates_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function symbolToCode(symbolOrCode) {
  if (!symbolOrCode) return 'INR';
  const match = SUPPORTED_CURRENCIES.find(
    c => c.symbol === symbolOrCode || c.code === symbolOrCode
  );
  return match ? match.code : 'INR';
}

export function codeToSymbol(codeOrSymbol) {
  if (!codeOrSymbol) return '₹';
  const match = SUPPORTED_CURRENCIES.find(
    c => c.code === codeOrSymbol || c.symbol === codeOrSymbol
  );
  return match ? match.symbol : '₹';
}

export async function fetchExchangeRates() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.rates) {
        return { rates: parsed.rates, isFallback: false, timestamp: parsed.timestamp };
      }
    }

    const apiUrl = import.meta.env.VITE_EXCHANGE_RATE_API_URL || 'https://open.er-api.com/v6/latest/USD';
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    if (data && data.rates) {
      const rates = data.rates;
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates,
        timestamp: Date.now()
      }));
      return { rates, isFallback: false, timestamp: Date.now() };
    }
    throw new Error('Invalid rate response format');
  } catch (err) {
    console.warn('[currencyService] Exchange rate fetch fallback:', err.message);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.rates) {
          return { rates: parsed.rates, isFallback: true, timestamp: parsed.timestamp };
        }
      } catch (e) {}
    }
    return { rates: FALLBACK_RATES, isFallback: true, timestamp: Date.now() };
  }
}

export function getCurrentRates() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.rates) return parsed.rates;
    }
  } catch (e) {}
  return FALLBACK_RATES;
}

export function convertCurrency(amount, fromCurrency = 'INR', toCurrency = 'INR', rates = null) {
  if (amount === undefined || amount === null || isNaN(amount)) return 0;
  const numeric = Number(amount);
  if (numeric === 0) return 0;

  const activeRates = rates || getCurrentRates();
  const fromCode = symbolToCode(fromCurrency);
  const toCode = symbolToCode(toCurrency);

  if (fromCode === toCode) return numeric;

  const fromRate = activeRates[fromCode] || FALLBACK_RATES[fromCode] || 1;
  const toRate = activeRates[toCode] || FALLBACK_RATES[toCode] || 1;

  // Formula: convertedAmount = originalAmount * (targetRate / baseRate)
  return numeric * (toRate / fromRate);
}

export function formatCurrencyValue(amount, currency = 'INR', options = {}) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const sym = codeToSymbol(currency);
    return `${sym}0`;
  }

  const numeric = Number(amount);
  const code = symbolToCode(currency);
  const currObj = SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];

  const decimals = options.decimals !== undefined ? options.decimals : currObj.decimals;

  const formattedNumber = new Intl.NumberFormat(currObj.locale || 'en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(Math.abs(numeric));

  const sign = numeric < 0 ? '-' : '';
  const symbol = currObj.symbol;

  return `${sign}${symbol}${formattedNumber}`;
}

