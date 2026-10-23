// @vitest-environment jsdom

import { render, screen } from '@testing-library/react/pure';
import { describe, expect, it } from 'vitest';

import { ActivityServiceProvider } from './ActivityServiceContext';
import { LocaleProvider } from './LocaleContext';
import { ProfilePanel } from './ProfilePanel';

/**
 * Готовит локальные данные провайдеров без сетевого сервиса и моков компонентов.
 *
 * @returns {{ locale: string, activityService: { getRecentActivity: Function } }}
 */
const mockDefault = () => ({
  locale: 'ru',
  activityService: {
    getRecentActivity: (profileId) =>
      profileId === 'profile-1' ? [{ id: 'activity-1', text: 'Обновил профиль' }] : [],
  },
});

describe('🐛 spec ProfilePanel: React Testing Library, настоящие дети', () => {
  it('🧪 показывает имя и активность из настоящих дочерних компонентов', () => {
    expect.hasAssertions();

    //☣️ Arrange
    const { locale, activityService } = mockDefault();

    //🔥 Act
    render(
      <LocaleProvider locale={locale}>
        <ActivityServiceProvider service={activityService}>
          <ProfilePanel />
        </ActivityServiceProvider>
      </LocaleProvider>,
    );

    //❓ Assert
    expect(screen.getByRole('article', { name: 'Карточка пользователя' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('имя из профиля');
    expect(screen.getByRole('list', { name: 'Recent activity' }).textContent).toBe('Обновил профиль');
  });
});
