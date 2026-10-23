import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { updateOrderSummary as before } from '../src/01-before.js';
import { updateOrderSummary as afterExtract } from '../src/02-extract-function.js';
import { updateOrderSummary as afterSeparate } from '../src/03-separate-query.js';
import { mockDefault } from '../support/mockDefault.js';
import { orderCases } from '../support/orderCases.js';

const versions = [
  ['исходный код', before],
  ['после Extract Function', afterExtract],
  ['после разделения запроса и записи', afterSeparate],
];

for (const [name, updateOrderSummary] of versions) {
  describe(`🐛 spec updateOrderSummary: ${name}`, () => {
    for (const scenario of orderCases) {
      it(`🧪 ${scenario.name}`, (context) => {
        //☣️ Arrange
        const { effects, readItems } = mockDefault(context);
        readItems.mock.mockImplementation(() => structuredClone(scenario.items));

        //🔥 Act
        const total = updateOrderSummary(scenario.coupon);

        //❓ Assert
        assert.equal(total, scenario.expected);
        assert.deepEqual(effects, [
          ['showTotal', scenario.expected],
          ['saveTotal', scenario.expected],
        ]);
      });
    }

    it('🧪 передаёт ошибку чтения, не показывая и не сохраняя новый итог', (context) => {
      //☣️ Arrange
      const { effects, readItems } = mockDefault(context);
      const error = new Error('Корзина повреждена');
      readItems.mock.mockImplementation(() => {
        throw error;
      });

      //🔥 Act
      const update = () => updateOrderSummary();

      //❓ Assert
      assert.throws(update, (actualError) => actualError === error);
      assert.deepEqual(effects, []);
    });
  });
}
