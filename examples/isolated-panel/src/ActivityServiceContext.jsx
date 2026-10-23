import { createContext, useContext } from 'react';

const ActivityServiceContext = createContext(null);

export function ActivityServiceProvider({ service, children }) {
  return <ActivityServiceContext value={service}>{children}</ActivityServiceContext>;
}

export function useActivityService() {
  const service = useContext(ActivityServiceContext);

  if (service === null) {
    throw new Error('ActivityFeed requires ActivityServiceProvider');
  }

  return service;
}
