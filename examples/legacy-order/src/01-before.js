import { cartStorage } from './cartStorage.js';
import { orderView } from './orderView.js';

export function updateOrderSummary(coupon = '') {
  const items = cartStorage.readItems();
  let subtotal = 0;

  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  const discount = coupon === 'SAVE10' ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal === 0 || subtotal >= 500_000 ? 0 : 30_000;
  const total = subtotal - discount + delivery;

  orderView.showTotal(total);
  cartStorage.saveTotal(total);

  return total;
}
