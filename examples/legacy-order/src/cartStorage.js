export const cartStorage = {
  readItems() {
    return JSON.parse(globalThis.localStorage.getItem('cart') ?? '[]');
  },

  saveTotal(total) {
    globalThis.localStorage.setItem('order-total', String(total));
  },
};
