export const orderCases = [
  {
    name: 'учитывает количество товаров и добавляет доставку',
    items: [
      { price: 150_000, quantity: 2 },
      { price: 50_000, quantity: 1 },
    ],
    coupon: '',
    expected: 380_000,
  },
  {
    name: 'применяет скидку к товарам, но не к доставке',
    items: [{ price: 100_000, quantity: 2 }],
    coupon: 'SAVE10',
    expected: 210_000,
  },
  {
    name: 'не начисляет доставку пустой корзине',
    items: [],
    coupon: 'SAVE10',
    expected: 0,
  },
  {
    name: 'сохраняет бесплатную доставку, когда скидка уменьшила сумму ниже порога',
    items: [{ price: 250_000, quantity: 2 }],
    coupon: 'SAVE10',
    expected: 450_000,
  },
  {
    name: 'округляет скидку до целой копейки',
    items: [{ price: 19_995, quantity: 1 }],
    coupon: 'SAVE10',
    expected: 47_995,
  },
  {
    name: 'не применяет неизвестный промокод',
    items: [{ price: 100_000, quantity: 1 }],
    coupon: 'UNKNOWN',
    expected: 130_000,
  },
];
