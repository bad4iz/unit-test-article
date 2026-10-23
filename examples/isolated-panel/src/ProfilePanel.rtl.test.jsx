// @vitest-environment jsdom

import { render, screen } from '@testing-library/react/pure';
import { describe, expect, it, vi } from 'vitest';

import { ActivityFeed } from './ActivityFeed';
import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel');
vi.mock('./UserCard');
vi.mock('./ActivityFeed');

/**
 * Задаёт обычный ответ setup-хука и пустую разметку дочерних компонентов.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useSetupProfilePanel.mockReturnValue({
    isLoading: false,
    userCardProps: { name: 'имя по умолчанию' },
    activityFeedProps: { profileId: 'default-profile' },
  });
  UserCard.mockReturnValue(null);
  ActivityFeed.mockReturnValue(null);
};

describe('🐛 spec ProfilePanel: React Testing Library, изоляция', () => {
  it('🧪 задаёт подпись секции и текст заголовка', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    render(<ProfilePanel />);

    //❓ Assert
    expect(screen.getByRole('region', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Your profile');
  });

  it('🧪 собирает карточку и ленту с данными setup-хука', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    const userCardProps = { name: 'имя из хука' };
    const activityFeedProps = { profileId: 'profile-42' };
    useSetupProfilePanel.mockReturnValue({
      isLoading: false,
      userCardProps,
      activityFeedProps,
    });

    //🔥 Act
    render(<ProfilePanel />);

    //❓ Assert
    expect(UserCard.mock.calls.at(-1)?.[0]).toEqual(userCardProps);
    expect(ActivityFeed.mock.calls.at(-1)?.[0]).toEqual(activityFeedProps);
  });

  it('🧪 показывает загрузку без карточки и ленты', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useSetupProfilePanel.mockReturnValue({
      isLoading: true,
      userCardProps: null,
      activityFeedProps: null,
    });

    //🔥 Act
    render(<ProfilePanel />);

    //❓ Assert
    expect(screen.getByRole('status').textContent).toBe('Loading profile...');
    expect(UserCard).not.toHaveBeenCalled();
    expect(ActivityFeed).not.toHaveBeenCalled();
  });
});
