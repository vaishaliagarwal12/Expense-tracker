export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getCurrentMonthYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthYearLabel(monthYearStr) {
  if (!monthYearStr || !/^\d{4}-\d{2}$/.test(monthYearStr)) return monthYearStr;
  const [year, month] = monthYearStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPastMonthsOptions(count = 12) {
  const options = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const val = `${y}-${m}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    options.push({ value: val, label });
  }
  return options;
}
