export function formatCurrency(amount, symbol = '₹') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0`;
  }
  const numeric = Number(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.abs(numeric));

  return `${numeric < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function formatNumber(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN').format(amount);
}
