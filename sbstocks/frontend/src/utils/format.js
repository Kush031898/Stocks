export const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
};

export const formatNumber = (val) => {
  if (!val) return '0';
  return new Intl.NumberFormat('en-US').format(val);
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return '0.00%';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${Number(val).toFixed(2)}%`;
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
