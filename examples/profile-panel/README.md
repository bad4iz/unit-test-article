# ProfilePanel: пример к статье

Один компонент, два способа проверки. Shallowly проверяет, что `ProfilePanel` передаёт в `UserCard` и в родительский callback. React Testing Library проверяет кнопки и изменение состояния уже с настоящим React.

Для запуска подойдёт Node.js 22 от версии 22.12 или Node.js 24. Пример проверен на Node.js 22.16.0.

Из корня репозитория:

```bash
cd examples/profile-panel
npm ci
npm test
npm run typecheck
```

В `package-lock.json` закреплены зависимости. Основные версии: Shallowly 1.1.1, React 19.2.4, Vitest 4.0.18 и TypeScript 5.9.3.

- `src/ProfilePanel.shallow.test.tsx`: пять проверок в Node. `useProfile` подменён через `vi.mock`; `UserCard` настоящий, но Shallowly его не выполняет. Вызов `onSelect()` — обычный вызов функции, не клик по DOM.
- `src/ProfilePanel.dom.test.tsx`: две проверки в jsdom. Хук и дочерний компонент выполняются; `user-event` нажимает кнопки, React обновляет состояние. Это тесты в эмуляции DOM, не в настоящем браузере.

В настоящем хуке лежит локальный профиль Ada Lovelace. Запроса к серверу нет. Для shallow-тестов хук возвращает Grace Hopper или состояние загрузки: так видно, откуда компонент берёт данные. Имена и идентификаторы специально различаются, чтобы тест поймал передачу имени вместо `id`.
