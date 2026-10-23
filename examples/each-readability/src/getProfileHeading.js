import { fetchProfile } from './profileApi.js';

export async function getProfileHeading() {
  const profile = await fetchProfile();

  if (profile === null) {
    return 'Профиль не найден';
  }

  return `Профиль: ${profile.name}`;
}
