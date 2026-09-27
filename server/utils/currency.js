const toMinorUnits = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
};

const formatLKR = (value) => `Rs. ${value.toLocaleString('en-LK', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

module.exports = { toMinorUnits, formatLKR };
