/**
 * Учебный источник данных: возвращает локальный профиль, запросов в сеть нет.
 *
 * @returns {Promise<{ id: string, name: string, preferences: { locale: string } }>}
 */
export async function fetchProfile() {
  return {
    id: 'profile-1',
    name: 'имя из источника',
    preferences: { locale: 'ru' },
  };
}
