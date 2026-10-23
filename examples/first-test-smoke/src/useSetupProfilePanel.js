import { useProfile } from './useProfile';

export function useSetupProfilePanel() {
  const state = useProfile();

  if (state.status === 'loading') {
    return { isLoading: true, userCardProps: null };
  }

  return {
    isLoading: false,
    userCardProps: { name: state.profile.name },
  };
}
