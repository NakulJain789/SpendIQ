// Format numbers to Indian Rupee (INR) currency style
export const formatINR = (amount, includeSymbol = true) => {
  const numericAmount = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2
  }).format(Math.abs(numericAmount));

  if (!includeSymbol) return formatted;
  return `${numericAmount < 0 ? '-' : ''}₹${formatted}`;
};

// Compact Indian format (e.g. ₹1.2L, ₹45K)
export const formatCompactINR = (amount) => {
  const num = Math.abs(Number(amount) || 0);
  const sign = Number(amount) < 0 ? '-' : '';

  if (num >= 10000000) {
    return `${sign}₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `${sign}₹${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${sign}₹${(num / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${num}`;
};

// Format dates gracefully
export const formatDate = (dateString, formatType = 'medium') => {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '';

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (formatType === 'relative') {
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
  }

  if (formatType === 'short') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Formats YYYY-MM-DD for HTML date inputs
export const toInputDateFormat = (date = new Date()) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getMonthName = (monthNumber) => {
  return MONTH_NAMES[(monthNumber - 1) % 12] || '';
};
