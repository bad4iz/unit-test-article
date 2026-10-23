import { useProfile } from './useProfile';

export function useSetupProfilePanel() {
  const state = useProfile();

  if (state.status === 'loading') {
    return {
      isLoading: true as const,
      userCardProps: null,
    };
  }

  return {
    isLoading: false as const,
    userCardProps: {
      name: state.profile.name,
    },
  };
}
