import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel', () => ({ useSetupProfilePanel: vi.fn() }));

const mockedSetup = vi.mocked(useSetupProfilePanel);
const userCardProps = { name: 'Grace Hopper' };

const mockDefault = () => {
  mockedSetup.mockReturnValue({ isLoading: false, userCardProps });
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

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('🧪 показывает сообщение о загрузке без карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    mockedSetup.mockReturnValue({ isLoading: true, userCardProps: null });

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
