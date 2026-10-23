import { useActivityService } from './ActivityServiceContext';

export function ActivityFeed({ profileId }) {
  const service = useActivityService();
  const activities = service.getRecentActivity(profileId);

  return (
    <ul aria-label="Recent activity">
      {activities.map((activity) => (
        <li key={activity.id}>{activity.text}</li>
      ))}
    </ul>
  );
}
