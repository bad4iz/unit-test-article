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

describe('🐛 spec getProfileHeading: явные сценарии', () => {
  it('🧪 готовит заголовок с именем из API', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    const { profile } = mockDefault();
    fetchProfile.mockResolvedValue({ ...profile, name: 'имя из API' });

    //🔥 Act
    const result = await getProfileHeading();

    //❓ Assert
    expect(result).toBe('Профиль: имя из API');
  });

  it('🧪 сообщает об отсутствии профиля', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    fetchProfile.mockResolvedValue(null);

    //🔥 Act
    const result = await getProfileHeading();

    //❓ Assert
    expect(result).toBe('Профиль не найден');
  });

  it('🧪 передаёт ошибку источника', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    fetchProfile.mockRejectedValue(new Error('Сервис недоступен'));

    //🔥 Act
    const result = getProfileHeading();

    //❓ Assert
    await expect(result).rejects.toThrow('Сервис недоступен');
  });
});
