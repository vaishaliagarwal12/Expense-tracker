import {
  convertCurrency,
  formatCurrencyValue,
  symbolToCode,
  getCurrentRates
} from '../services/currencyService';

export function formatCurrency(amount, symbolOrCode, options = {}) {
  const displayCode = symbolOrCode
    ? symbolToCode(symbolOrCode)
    : symbolToCode(localStorage.getItem('fintrack_display_currency') || 'INR');

  const baseCode = symbolToCode(
    options.fromCurrency || localStorage.getItem('fintrack_base_currency') || 'INR'
  );

  const rates = getCurrentRates();
  const converted = convertCurrency(amount, baseCode, displayCode, rates);
  return formatCurrencyValue(converted, displayCode, options);
}

export function formatNumber(amount, locale = 'en-US') {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return new Intl.NumberFormat(locale).format(amount);
}

