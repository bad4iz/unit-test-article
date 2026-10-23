import { describe, expect, it, vi } from 'vitest';

import { useProfile } from './useProfile';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useProfile');

/**
 * Задаёт готовый профиль; нужные отклонения задаём в Arrange конкретного теста.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'profile-1', name: 'имя по умолчанию' },
  });
};

describe('🐛 spec useSetupProfilePanel', () => {
  it('🧪 smoke: выполняется с обычным ответом зависимости', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const result = useSetupProfilePanel();

    //❓ Assert
    expect(result).toBeDefined();
  });

  it('🧪 готовит имя для карточки из полученного профиля', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useProfile.mockReturnValue({
      status: 'ready',
      profile: { id: 'profile-42', name: 'другое имя' },
    });

    //🔥 Act
    const result = useSetupProfilePanel();

    //❓ Assert
    expect(result).toEqual({
      isLoading: false,
      userCardProps: { name: 'другое имя' },
    });
  });

  it('🧪 сообщает о загрузке без данных карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useProfile.mockReturnValue({ status: 'loading' });

    //🔥 Act
    const result = useSetupProfilePanel();

    //❓ Assert
    expect(result).toEqual({ isLoading: true, userCardProps: null });
  });
});
