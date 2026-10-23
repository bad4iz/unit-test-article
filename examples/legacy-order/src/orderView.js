export const orderView = {
  showTotal(total) {
    const element = globalThis.document.querySelector('[data-order-total]');
    element.textContent = `${(total / 100).toFixed(2)} ₽`;
  },
};
