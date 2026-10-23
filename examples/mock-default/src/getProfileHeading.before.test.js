import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getProfileHeading } from './getProfileHeading';
import { fetchProfile } from './profileApi';

vi.mock('./profileApi');

// Исполняемый вариант «до» для сравнения с getProfileHeading.test.js.
describe('🐛 spec getProfileHeading: вариант с beforeEach', () => {
  beforeEach(() => {
    fetchProfile.mockResolvedValue({
      id: 'profile-1',
      name: 'имя по умолчанию',
      preferences: { locale: 'ru' },
    });
  });

  it('🧪 подставляет имя из профиля в заголовок', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    // Обычный ответ задан во внешнем beforeEach.

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль: имя по умолчанию');
  });

  describe('если профиль не найден', () => {
    beforeEach(() => {
      fetchProfile.mockResolvedValue(null);
    });

    it('🧪 сообщает, что профиль не найден', async () => {
      expect.hasAssertions();

      //☣️ Arrange
      // Вложенный beforeEach переопределяет ответ внешнего.

      //🔥 Act
      const heading = await getProfileHeading();

      //❓ Assert
      expect(heading).toBe('Профиль не найден');
    });
  });
});
