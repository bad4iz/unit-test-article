// @vitest-environment jsdom

import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useProfile } from './useProfile';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useProfile', () => ({ useProfile: vi.fn() }));

const mockedUseProfile = vi.mocked(useProfile);

beforeEach(() => mockedUseProfile.mockReset());
afterEach(cleanup);

it('готовит имя для карточки из полученного профиля', () => {
  mockedUseProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'grace', name: 'Grace Hopper' },
  });

  const { result } = renderHook(() => useSetupProfilePanel());

  expect(result.current).toEqual({
    isLoading: false,
    userCardProps: { name: 'Grace Hopper' },
  });
});

it('сигнализирует о загрузке без пропсов карточки', () => {
  mockedUseProfile.mockReturnValue({ status: 'loading' });

  const { result } = renderHook(() => useSetupProfilePanel());

  expect(result.current).toEqual({ isLoading: true, userCardProps: null });
});
