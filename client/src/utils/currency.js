const rupees = new Intl.NumberFormat('en-LK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatLKR = (amount) => `Rs. ${rupees.format(amount)}`;
