export function generateSampleCsv() {
  const headers = ['Date', 'Amount', 'Type', 'Category', 'Description', 'Payment Method', 'Notes'];
  const sampleRows = [
    ['2026-08-01', '85000', 'income', 'Salary', 'Monthly Tech Salary Credit', 'Bank Transfer', 'Direct Deposit'],
    ['2026-08-05', '6400', 'expense', 'Food', 'Groceries & Essentials', 'Debit Card', 'Supermarket'],
    ['2026-08-08', '15000', 'income', 'Freelancing', 'UI Consultation Milestone', 'UPI', 'Client Payment'],
    ['2026-08-10', '22000', 'expense', 'Rent', 'Apartment Rent Payment', 'Bank Transfer', 'Monthly']
  ];
  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
}

export function downloadFile(content, fileName, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
