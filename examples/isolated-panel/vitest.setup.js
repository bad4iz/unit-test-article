import { afterEach } from 'vitest';

// В node-файлах DOM нет. RTL/pure не регистрирует второй обработчик очистки.
if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react/pure');
  afterEach(cleanup);
}
