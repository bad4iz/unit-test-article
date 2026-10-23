import { describe, expect, it, vi } from 'vitest';

import { getProfileHeading } from './getProfileHeading';
import { mockDefault } from './mockDefault';
import { fetchProfile } from './profileApi';

vi.mock('./profileApi');

// Порядок нужен только этой демонстрации: сначала оставляем состояние, затем проверяем сброс.
describe.sequential('🐛 spec конфигурация сброса и свежие данные', () => {
  it('🧪 использует разовый ответ и оставляет ещё один в очереди', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    const { profile } = mockDefault();
    profile.preferences.locale = 'en';
    fetchProfile
      .mockResolvedValueOnce({ ...profile, name: 'первый ответ' })
      .mockResolvedValueOnce({ ...profile, name: 'неиспользованный ответ' });

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль: первый ответ');
    expect(fetchProfile).toHaveBeenCalledTimes(1);
  });

  it('🧪 начинает следующий тест без прежней очереди, истории и мутаций', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    const { profile } = mockDefault();

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль: имя по умолчанию');
    expect(fetchProfile).toHaveBeenCalledTimes(1);
    expect(profile.preferences.locale).toBe('ru');
  });
});
