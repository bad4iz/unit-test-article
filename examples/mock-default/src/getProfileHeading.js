import { fetchProfile } from './profileApi';

export async function getProfileHeading() {
  const profile = await fetchProfile();

  if (profile === null) {
    return 'Профиль не найден';
  }

  return `Профиль: ${profile.name}`;
}
