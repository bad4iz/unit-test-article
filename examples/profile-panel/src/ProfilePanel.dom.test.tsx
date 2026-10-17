// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ProfilePanel } from './ProfilePanel';

describe('🐛 spec ProfilePanel: взаимодействие с карточкой', () => {
  it('🧪 раскрывает и скрывает детали карточки по нажатию кнопки', async () => {
    expect.hasAssertions();

    //☣️ Arrange
    const user = userEvent.setup();

    //🔥 Act
    render(<ProfilePanel />);

    //❓ Assert
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeTruthy();
    expect(screen.queryByText('Profile details')).toBeNull();

    //🔥 Act
    await user.click(screen.getByRole('button', { name: 'Show details' }));

    //❓ Assert
    expect(screen.getByText('Profile details')).toBeTruthy();

    //🔥 Act
    await user.click(screen.getByRole('button', { name: 'Hide details' }));

    //❓ Assert
    expect(screen.queryByText('Profile details')).toBeNull();
  });
});
