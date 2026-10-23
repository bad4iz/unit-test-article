import { cartStorage } from '../src/cartStorage.js';
import { orderView } from '../src/orderView.js';

/**
 * Готовит свежую корзину и записывает видимые эффекты вместо DOM и localStorage.
 * Node восстанавливает методы через контекст текущего теста, ручная очистка не нужна.
 *
 * @param {import('node:test').TestContext} context Контекст текущего теста.
 * @returns {{ items: Array<{ price: number, quantity: number }>, effects: Array<Array<string | number>>, readItems: Function }}
 */
export const mockDefault = (context) => {
  const items = [{ price: 100_000, quantity: 2 }];
  const effects = [];
  const readItems = context.mock.method(cartStorage, 'readItems', () => items);

  context.mock.method(orderView, 'showTotal', (total) => {
    effects.push(['showTotal', total]);
  });
  context.mock.method(cartStorage, 'saveTotal', (total) => {
    effects.push(['saveTotal', total]);
  });

  return { items, effects, readItems };
};
