import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel');

/**
 * Готовит обычный ответ setup-хука для изолированной проверки разметки.
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
  it('🧪 smoke: собирает разметку без исключения', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const renderPanel = () => shallow(<ProfilePanel />);

    //❓ Assert
    expect(renderPanel).not.toThrow();
  });

  it('🧪 задаёт заголовок и использует имя из setup-хука для карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    const userCardProps = { name: 'имя из хука' };
    useSetupProfilePanel.mockReturnValue({ isLoading: false, userCardProps });

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('h1').prop('children')).toBe('Your profile');
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('🧪 показывает загрузку без карточки', () => {
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
