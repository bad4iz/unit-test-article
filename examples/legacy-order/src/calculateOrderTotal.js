export function calculateOrderTotal(items, coupon = '') {
  let subtotal = 0;

  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  const discount = coupon === 'SAVE10' ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal === 0 || subtotal >= 500_000 ? 0 : 30_000;
  const total = subtotal - discount + delivery;

  return total;
}
