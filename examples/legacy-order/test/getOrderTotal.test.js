import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getOrderTotal } from '../src/03-separate-query.js';
import { mockDefault } from '../support/mockDefault.js';

describe('🐛 spec getOrderTotal: получение суммы без записи', () => {
  it('🧪 позволяет получить итог, не обновляя страницу и хранилище', (context) => {
    //☣️ Arrange
    const { effects } = mockDefault(context);

    //🔥 Act
    const total = getOrderTotal('SAVE10');

    //❓ Assert
    assert.equal(total, 210_000);
    assert.deepEqual(effects, []);
  });
});
