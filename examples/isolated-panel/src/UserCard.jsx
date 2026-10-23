import { useLocale } from './LocaleContext';

export function UserCard({ name }) {
  const locale = useLocale();

  return (
    <article aria-label={locale === 'ru' ? 'Карточка пользователя' : 'User card'}>
      <h2>{name}</h2>
    </article>
  );
}
