import { useState } from 'react';

export function useProfile() {
  const [state] = useState({
    status: 'ready',
    profile: { id: 'profile-1', name: 'имя из профиля' },
  });

  return state;
}
