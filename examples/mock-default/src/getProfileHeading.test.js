import { describe, expect, it, vi } from 'vitest';

import { getProfileHeading } from './getProfileHeading';
import { mockDefault } from './mockDefault';
import { fetchProfile } from './profileApi';

vi.mock('./profileApi');

describe('🐛 spec getProfileHeading: явная подготовка', () => {
  it('🧪 подставляет имя из профиля в заголовок', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль: имя по умолчанию');
  });

  it('🧪 использует другое имя из ответа API', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    const { profile } = mockDefault();
    fetchProfile.mockResolvedValueOnce({ ...profile, name: 'другое имя' });

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль: другое имя');
  });

  it('🧪 сообщает, что профиль не найден', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    fetchProfile.mockResolvedValueOnce(null);

    //🔥 Act
    const heading = await getProfileHeading();

    //❓ Assert
    expect(heading).toBe('Профиль не найден');
  });

  it('🧪 передаёт ошибку API вызывающему коду', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    const error = new Error('Профиль временно недоступен');
    fetchProfile.mockRejectedValueOnce(error);

    //🔥 Act
    const result = getProfileHeading();

    //❓ Assert
    await expect(result).rejects.toBe(error);
  });
});
