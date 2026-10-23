import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel');

/**
 * Задаёт готовый профиль для тестов, которым не нужен особый ответ хука.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useSetupProfilePanel.mockReturnValue({
    isLoading: false,
    userCardProps: { name: 'имя по умолчанию' },
  });
};

describe('🐛 spec ProfilePanel', () => {
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

  it('🧪 передаёт подготовленные пропсы в UserCard', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    const userCardProps = { name: 'имя из хука' };
    useSetupProfilePanel.mockReturnValue({ isLoading: false, userCardProps });

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('🧪 показывает сообщение о загрузке без карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useSetupProfilePanel.mockReturnValue({ isLoading: true, userCardProps: null });

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('p').props()).toEqual({
      role: 'status',
      children: 'Loading profile...',
    });
    expect(wrapper.find(UserCard).exists()).toBe(false);
  });
});
