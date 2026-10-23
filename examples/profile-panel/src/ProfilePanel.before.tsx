import { UserCard } from './UserCard';
import { useProfile } from './useProfile';

export function ProfilePanel() {
  const state = useProfile();

  if (state.status === 'loading') {
    return <p role="status">Loading profile...</p>;
  }

  return (
    <section aria-label="Profile">
      <h1>Your profile</h1>
      <UserCard name={state.profile.name} />
    </section>
  );
}
