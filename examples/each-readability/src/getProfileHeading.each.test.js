import { describe, expect, it, vi } from 'vitest';

import { getProfileHeading } from './getProfileHeading.js';
import { fetchProfile } from './profileApi.js';

vi.mock('./profileApi.js');

/**
 * Создаёт свежий профиль и задаёт обычный ответ источника для текущего теста.
 *
 * @returns {{ profile: { name: string } }}
 */
const mockDefault = () => {
  const profile = { name: 'имя по умолчанию' };
  fetchProfile.mockResolvedValue(profile);
  return { profile };
};

describe('🐛 spec getProfileHeading: позиционная таблица', () => {
  it.each([
    ['готовит заголовок с именем из API', { name: 'имя из API' }, null, 'Профиль: имя из API'],
    ['сообщает об отсутствии профиля', null, null, 'Профиль не найден'],
    ['передаёт ошибку источника', undefined, new Error('Сервис недоступен'), 'Сервис недоступен'],
  ])('🧪 %s', async (_title, profile, error, expected) => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    if (error) {
      fetchProfile.mockRejectedValue(error);
    } else {
      fetchProfile.mockResolvedValue(profile);
    }

    //🔥 Act
    const result = getProfileHeading();

    //❓ Assert
    if (error) {
      await expect(result).rejects.toThrow(expected);
    } else {
      await expect(result).resolves.toBe(expected);
    }
  });
});
