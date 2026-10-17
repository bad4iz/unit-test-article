// @vitest-environment jsdom

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useProfile } from './useProfile';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useProfile', () => ({ useProfile: vi.fn() }));

const mockedUseProfile = vi.mocked(useProfile);

const mockDefault = () => {
  mockedUseProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'grace', name: 'Grace Hopper' },
  });
};

describe('🐛 spec useSetupProfilePanel', () => {
  it('🧪 готовит имя для карточки из полученного профиля', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const { result } = renderHook(() => useSetupProfilePanel());

    //❓ Assert
    expect(result.current).toEqual({
      isLoading: false,
      userCardProps: { name: 'Grace Hopper' },
    });
  });

  it('🧪 сигнализирует о загрузке без пропсов карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    mockedUseProfile.mockReturnValue({ status: 'loading' });

    //🔥 Act
    const { result } = renderHook(() => useSetupProfilePanel());

    //❓ Assert
    expect(result.current).toEqual({ isLoading: true, userCardProps: null });
  });
});
