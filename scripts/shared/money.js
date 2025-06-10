export function formatCurrency(priceCents) {
  return (Math.round(priceCents) / 100).toFixed(0);
}

// New function to format price ranges from lower_price and higher_price
export function formatPriceRange(lowerPrice, higherPrice) {
  if (!lowerPrice && !higherPrice) {
    return 'Price not available';
  }
  
  const lower = formatCurrency(lowerPrice || 0);
  const higher = formatCurrency(higherPrice || lowerPrice || 0);
  
  // Always show range format, even when prices are the same
  return `USD:$${lower}~$${higher}`;
}