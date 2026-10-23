import { ActivityFeed } from './ActivityFeed';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

export function ProfilePanel() {
  const { isLoading, userCardProps, activityFeedProps } = useSetupProfilePanel();

  if (isLoading) {
    return <p role="status">Loading profile...</p>;
  }

  return (
    <section aria-label="Profile">
      <h1>Your profile</h1>
      <UserCard {...userCardProps} />
      <ActivityFeed {...activityFeedProps} />
    </section>
  );
}
