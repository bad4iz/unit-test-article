import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ActivityFeed } from './ActivityFeed';
import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel');

/**
 * Задаёт обычный ответ setup-хука; особые состояния меняем в самом тесте.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useSetupProfilePanel.mockReturnValue({
    isLoading: false,
    userCardProps: { name: 'имя по умолчанию' },
    activityFeedProps: { profileId: 'default-profile' },
  });
};

describe('🐛 spec ProfilePanel: Shallowly', () => {
  it('🧪 задаёт подпись секции и текст заголовка', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('section').prop('aria-label')).toBe('Profile');
    expect(wrapper.find('h1').prop('children')).toBe('Your profile');
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
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
    expect(wrapper.find(ActivityFeed).props()).toEqual(activityFeedProps);
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
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('p').props()).toEqual({
      role: 'status',
      children: 'Loading profile...',
    });
    expect(wrapper.find(UserCard).exists()).toBe(false);
    expect(wrapper.find(ActivityFeed).exists()).toBe(false);
  });
});
