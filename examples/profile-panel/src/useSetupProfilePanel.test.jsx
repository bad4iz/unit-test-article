// @vitest-environment jsdom

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useProfile } from './useProfile';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useProfile');

/**
 * Задаёт готовый профиль как исходное состояние источника данных.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'default-profile', name: 'имя по умолчанию' },
  });
};

describe('🐛 spec useSetupProfilePanel', () => {
  it('🧪 готовит имя для карточки из полученного профиля', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useProfile.mockReturnValue({
      status: 'ready',
      profile: { id: 'test-profile', name: 'имя из хука' },
    });

    //🔥 Act
    const { result } = renderHook(() => useSetupProfilePanel());

    //❓ Assert
    expect(result.current).toEqual({
      isLoading: false,
      userCardProps: { name: 'имя из хука' },
    });
  });

  it('🧪 сигнализирует о загрузке без пропсов карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useProfile.mockReturnValue({ status: 'loading' });

    //🔥 Act
    const { result } = renderHook(() => useSetupProfilePanel());

    //❓ Assert
    expect(result.current).toEqual({ isLoading: true, userCardProps: null });
  });
});
