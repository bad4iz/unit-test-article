import { fetchProfile } from './profileApi';

/**
 * Создаёт свежий профиль и задаёт обычный ответ API для текущего теста.
 * Очередь разовых ответов и историю вызовов сбрасывает mockReset в конфигурации.
 *
 * @returns {{ profile: { id: string, name: string, preferences: { locale: string } } }}
 */
export const mockDefault = () => {
  const profile = {
    id: 'profile-1',
    name: 'имя по умолчанию',
    preferences: { locale: 'ru' },
  };

  fetchProfile.mockResolvedValue(profile);

  return { profile };
};
