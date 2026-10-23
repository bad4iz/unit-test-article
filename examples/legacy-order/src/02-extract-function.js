import { calculateOrderTotal } from './calculateOrderTotal.js';
import { cartStorage } from './cartStorage.js';
import { orderView } from './orderView.js';

export function updateOrderSummary(coupon = '') {
  const items = cartStorage.readItems();
  const total = calculateOrderTotal(items, coupon);

  orderView.showTotal(total);
  cartStorage.saveTotal(total);

  return total;
}
