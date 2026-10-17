import { shallow } from 'shallowly';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel', () => ({ useSetupProfilePanel: vi.fn() }));

const mockedSetup = vi.mocked(useSetupProfilePanel);
const userCardProps = { name: 'Grace Hopper' };

beforeEach(() => {
  mockedSetup.mockReset();
  mockedSetup.mockReturnValue({ isLoading: false, userCardProps });
});

describe('ProfilePanel: разметка и передача пропсов', () => {
  it('задаёт подпись секции и текст заголовка', () => {
    const wrapper = shallow(<ProfilePanel />);

    expect(wrapper.find('section').prop('aria-label')).toBe('Profile');
    expect(wrapper.find('h1').prop('children')).toBe('Your profile');
  });

  it('передаёт подготовленные пропсы в UserCard', () => {
    const wrapper = shallow(<ProfilePanel />);

    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('передаёт пропсы сообщению о загрузке и не выводит карточку', () => {
    mockedSetup.mockReturnValue({ isLoading: true, userCardProps: null });

    const wrapper = shallow(<ProfilePanel />);

    expect(wrapper.find('p').props()).toEqual({
      role: 'status',
      children: 'Loading profile...',
    });
    expect(wrapper.find(UserCard).exists()).toBe(false);
  });
});
