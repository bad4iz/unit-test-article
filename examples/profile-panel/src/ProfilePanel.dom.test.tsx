// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { ProfilePanel } from './ProfilePanel';

afterEach(cleanup);

it('раскрывает и скрывает детали карточки по нажатию кнопки', async () => {
  const user = userEvent.setup();
  render(<ProfilePanel />);

  expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeTruthy();
  expect(screen.queryByText('Profile details')).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Show details' }));
  expect(screen.getByText('Profile details')).toBeTruthy();

  await user.click(screen.getByRole('button', { name: 'Hide details' }));
  expect(screen.queryByText('Profile details')).toBeNull();
});
