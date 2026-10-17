import { shallow } from 'shallowly';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useProfile } from './useProfile';

vi.mock('./useProfile', () => ({ useProfile: vi.fn() }));

const mockedUseProfile = vi.mocked(useProfile);

beforeEach(() => {
  mockedUseProfile.mockReset();
  mockedUseProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'grace', name: 'Grace Hopper' },
  });
});

describe('ProfilePanel: изолированные проверки', () => {
  it('возвращает секцию с заголовком и карточкой', () => {
    const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

    expect(wrapper.textInline()).toBe('<section><h1>Your profile</h1><UserCard /></section>');
    expect(wrapper.find('section').prop('aria-label')).toBe('Profile');
  });

  it('передаёт имя из хука в карточку', () => {
    const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

    expect(wrapper.find(UserCard).props()).toEqual({
      name: 'Grace Hopper',
      onSelect: expect.any(Function),
    });
  });

  it('передаёт id выбранного профиля в родительский callback', () => {
    const onProfileSelected = vi.fn();
    const wrapper = shallow(<ProfilePanel onProfileSelected={onProfileSelected} />);
    const onSelect: unknown = wrapper.find(UserCard).prop('onSelect');

    if (typeof onSelect !== 'function') {
      throw new TypeError('Ожидалась функция UserCard.onSelect');
    }

    onSelect();

    expect(onProfileSelected).toHaveBeenCalledExactlyOnceWith('grace');
  });

  it('показывает загрузку вместо карточки', () => {
    mockedUseProfile.mockReturnValue({ status: 'loading' });

    const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

    expect(wrapper.textInline()).toBe('<p>Loading profile...</p>');
    expect(wrapper.find('p').prop('role')).toBe('status');
    expect(wrapper.find(UserCard).exists()).toBe(false);
  });

  it('оставляет UserCard на границе, не выполняя его useState', () => {
    const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

    expect(wrapper.find(UserCard).textInline()).toBe('<UserCard />');
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
