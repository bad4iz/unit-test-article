import { calculateOrderTotal } from './calculateOrderTotal.js';
import { cartStorage } from './cartStorage.js';
import { orderView } from './orderView.js';

export function getOrderTotal(coupon = '') {
  const items = cartStorage.readItems();
  return calculateOrderTotal(items, coupon);
}

export function applyOrderTotal(total) {
  orderView.showTotal(total);
  cartStorage.saveTotal(total);
}

// Старые вызывающие места по-прежнему получают сумму и оба побочных эффекта.
export function updateOrderSummary(coupon = '') {
  const total = getOrderTotal(coupon);
  applyOrderTotal(total);
  return total;
}
