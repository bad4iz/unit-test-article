import { useState } from 'react';

export interface Profile {
  id: string;
  name: string;
}

export type ProfileState = { status: 'loading' } | { status: 'ready'; profile: Profile };

export function useProfile(): ProfileState {
  // Данные локальные: запросы к серверу здесь не разбираем.
  const [state] = useState<ProfileState>({
    status: 'ready',
    profile: { id: 'ada', name: 'Ada Lovelace' },
  });

  return state;
}
