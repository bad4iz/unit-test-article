# ProfilePanel: пример к статье

В `src/ProfilePanel.before.tsx` сохранён исходный компонент без входных пропсов. После рефакторинга `ProfilePanel` получает из `useSetupProfilePanel` признак загрузки и готовые пропсы карточки через деструктуризацию. Подготовка данных находится в хуке, разметка — в компоненте.

Для запуска подойдёт Node.js 22 от версии 22.12 или Node.js 24.

Из корня репозитория:

```bash
cd examples/profile-panel
npm ci
npm test
npm run typecheck
```

В `package-lock.json` закреплены зависимости. Основные версии: Shallowly 1.1.1, React 19.2.4, Vitest 4.0.18 и TypeScript 5.9.3.

- `src/ProfilePanel.shallow.test.tsx`: три проверки разметки и передачи пропсов. Подменяется только `useSetupProfilePanel`. Обработчики не вызываются, внутренности `UserCard` не выполняются.
- `src/useSetupProfilePanel.test.tsx`: две проверки подготовки данных через `renderHook`. Подменяется источник данных `useProfile`.
- `src/ProfilePanel.dom.test.tsx`: одна проверка с настоящими хуками и карточкой. Кнопка раскрывает и скрывает детали в jsdom.

В настоящем `useProfile` лежит локальный профиль Ada Lovelace. Запросов к серверу нет. В изолированных проверках используется Grace Hopper, чтобы заметить захардкоженное имя. DOM-тест проверяет взаимодействие с React в jsdom; настоящий браузер не запускается.
