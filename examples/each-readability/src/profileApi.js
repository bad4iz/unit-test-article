/**
 * Учебный источник: возвращает локальные данные, без сетевого запроса.
 *
 * @returns {Promise<{ name: string }>}
 */
export async function fetchProfile() {
  return { name: 'имя из источника' };
}
