export const formatNumberInput = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
  return isNaN(num) ? '' : num.toLocaleString('id-ID');
};

export const parseNumberInput = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};
