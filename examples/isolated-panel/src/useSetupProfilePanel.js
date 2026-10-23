import { useState } from 'react';

export function useSetupProfilePanel() {
  const [profile] = useState({ id: 'profile-1', name: 'имя из профиля' });

  return {
    isLoading: false,
    userCardProps: { name: profile.name },
    activityFeedProps: { profileId: profile.id },
  };
}
