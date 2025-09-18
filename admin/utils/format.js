export function formatCurrency(value, currency = 'EUR') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '–';
  }
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(Number(value));
}

export function formatDate(value) {
  if (!value) return '–';
  try {
    return new Intl.DateTimeFormat('de-DE').format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

export function splitLines(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}
