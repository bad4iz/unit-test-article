import { createContext, useContext } from 'react';

const LocaleContext = createContext(null);

export function LocaleProvider({ locale, children }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale() {
  const locale = useContext(LocaleContext);

  if (locale === null) {
    throw new Error('UserCard requires LocaleProvider');
  }

  return locale;
}
