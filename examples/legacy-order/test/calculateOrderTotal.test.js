import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateOrderTotal } from '../src/calculateOrderTotal.js';
import { orderCases } from '../support/orderCases.js';

describe('🐛 spec calculateOrderTotal: выделенный расчёт', () => {
  for (const scenario of orderCases) {
    it(`🧪 ${scenario.name}`, () => {
      //☣️ Arrange
      const items = structuredClone(scenario.items);

      //🔥 Act
      const total = calculateOrderTotal(items, scenario.coupon);

      //❓ Assert
      assert.equal(total, scenario.expected);
      assert.deepEqual(items, scenario.items);
    });
  }
});
