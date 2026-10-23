import { useState } from 'react';

export interface UserCardProps {
  name: string;
}

export function UserCard({ name }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article>
      <h2>{name}</h2>
      <button type="button" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide details' : 'Show details'}
      </button>
      {expanded && <p>Profile details</p>}
    </article>
  );
}
