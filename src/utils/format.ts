export const formatNumberInput = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
  return isNaN(num) ? '' : num.toLocaleString('id-ID');
};

export const parseNumberInput = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

export const formatCurrency = (value: number): string => {
  return 'Rp ' + value.toLocaleString('id-ID');
};

export const formatReceiptDate = (dateStr?: string): string => {
  const now = new Date();
  if (!dateStr) {
    return now.toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // Check if dateStr already has time (contains colon)
  if (dateStr.includes(':')) {
    return dateStr;
  }

  // If dateStr is just a date, parse it.
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    // Return date + current time
    const datePart = d.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timePart = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  }

  return dateStr;
};
