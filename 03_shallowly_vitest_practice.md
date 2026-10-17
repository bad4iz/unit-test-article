<!--
status: draft
created_at: 2026-10-17
habr_url: https://habr.com/ru/articles/1095628/
task_branch: codex/shallowly-practical-article
example: examples/profile-panel
example_ref: profile-panel-article-v3
cover: assets/shallowly-practice/cover-habr.jpg
feed_excerpt: На примере панели профиля вынесем логику и подготовку данных в `useSetup[Component]`, а в компоненте оставим разметку. Затем отдельно проверим setup-хук, компонент через Shallowly и взаимодействие через React Testing Library. В конце — полный пример с Vitest, который можно забрать и запустить.
-->

# React 19, Shallowly и Vitest: отделяем логику от разметки и тестируем компонент

В [прошлой статье](https://habr.com/ru/articles/927596/) я показал короткий тест с передачей пропсов. Теперь разберу компонент чуть подробнее: сначала приведу код к тому виду, в котором мне удобно с ним работать, а потом проверю его через свою библиотеку [Shallowly](https://www.npmjs.com/package/shallowly).

Начнём с панели профиля. Пока данные грузятся, она показывает сообщение. Когда профиль готов — передаёт имя в карточку. Входных пропсов у самой панели пока нет, усложнять пример ими не будем.

## Исходный компонент

```javascript
import { UserCard } from './UserCard';
import { useProfile } from './useProfile';

export function ProfilePanel() {
  const state = useProfile();

  if (state.status === 'loading') {
    return <p role="status">Loading profile...</p>;
  }

  return (
    <section aria-label="Profile">
      <h1>Your profile</h1>
      <UserCard name={state.profile.name} />
    </section>
  );
}
```

`useProfile` возвращает либо `{ status: 'loading' }`, либо `{ status: 'ready', profile }`. В примере внутри него обычный `useState` с локальным профилем. Запросов к бэку здесь нет. `UserCard` принимает `name` и умеет раскрывать детали через свой `useState`.

## Тесты и архитектура

Тесты не должны диктовать архитектуру проекта. Если ради удобства одной библиотеки приходится выворачивать рабочий код наизнанку, я бы сначала посмотрел на сам способ тестирования. Но это не мешает менять архитектуру в лучшую сторону. У более понятного кода и тесты часто получаются проще.

В нашей панели вместе живут разметка и подготовка данных для неё. Сейчас это несколько строк. В рабочем компоненте к ним легко добавляются вычисления, проверки прав, обработка ошибок. Всё это приходится читать вперемешку с JSX. Вынесем подготовку данных в хук, чтобы в компоненте было видно, какие элементы он собирает и что им передаёт.

- **Separation of Concerns — разделение задач.** Подготовка данных живёт в хуке, разметка — в компоненте. В JSX больше не нужно разбираться в устройстве результата `useProfile`.
- **Single Responsibility Principle — более узкая ответственность.** Изменение разметки относится к компоненту, изменение способа подготовки данных — к setup-хуку. Это разные причины менять код.
- **Инкапсуляция в custom hook.** Хук возвращает то, что нужно конкретной панели: признак загрузки и готовые пропсы карточки. Детали источника данных остаются внутри. Такой вынос логики в custom hooks описан и в [документации React](https://react.dev/learn/reusing-logic-with-custom-hooks).

Идею подсмотрел во *Vue 3* с его `setup`. В React предлагаю использовать соглашение `useSetup[Component]`: название сразу обозначает роль хука — собрать логику и подготовить данные для конкретного компонента. Для `ProfilePanel` это будет `useSetupProfilePanel`. В самом компоненте оставляем разметку.

## Выносим подготовку данных

Добавим `useSetupProfilePanel.ts`:

```typescript
import { useProfile } from './useProfile';

export function useSetupProfilePanel() {
  const state = useProfile();

  if (state.status === 'loading') {
    return {
      isLoading: true as const,
      userCardProps: null,
    };
  }

  return {
    isLoading: false as const,
    userCardProps: {
      name: state.profile.name,
    },
  };
}
```

Теперь исходный `state.status` превращается в понятный панели `isLoading`, а имя собирается в `userCardProps`. В состоянии загрузки пропсов карточки ещё нет. `as const` сохраняет для TypeScript значения `true` и `false` в качестве признаков двух вариантов результата. После проверки `isLoading` он понимает, что `userCardProps` уже не `null`.

В `ProfilePanel.tsx` остаётся:

```typescript
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

export function ProfilePanel() {
  const { isLoading, userCardProps } = useSetupProfilePanel();

  if (isLoading) {
    return <p role="status">Loading profile...</p>;
  }

  return (
    <section aria-label="Profile">
      <h1>Your profile</h1>
      <UserCard {...userCardProps} />
    </section>
  );
}
```

## Теперь тестируем компонент

Входных пропсов у `ProfilePanel` нет: тест рендерит его как `<ProfilePanel />`. Данные приходят из `useSetupProfilePanel`, а панель передаёт их дальше — в `UserCard` через `userCardProps`. Вот эту передачу и проверим: имя из хука должно попасть в карточку. Заодно проверим заголовок, подпись секции и сообщение о загрузке.

В shallow-тесте замокаю `useSetupProfilePanel` и задам готовый результат. Как хук получил имя и почему решил, что загрузка закончилась, здесь меня не интересует: это проверим отдельно в тестах хука.

Компонент и хук написаны на TypeScript, тесты ниже — на JavaScript. `ProfilePanel.shallow.test.jsx` целиком:

```javascript
import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel');

/**
 * Задаёт готовый профиль для тестов, которым не нужен особый ответ хука.
 *
 * @returns {void}
 */
const mockDefault = () => {
  useSetupProfilePanel.mockReturnValue({
    isLoading: false,
    userCardProps: { name: 'имя по умолчанию' },
  });
};

describe('🐛 spec ProfilePanel', () => {
  it('🧪 задаёт подпись секции и текст заголовка', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('section').prop('aria-label')).toBe('Profile');
    expect(wrapper.find('h1').prop('children')).toBe('Your profile');
  });

  it('🧪 передаёт подготовленные пропсы в UserCard', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    const userCardProps = { name: 'имя из хука' };
    useSetupProfilePanel.mockReturnValue({ isLoading: false, userCardProps });

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('🧪 показывает сообщение о загрузке без карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    useSetupProfilePanel.mockReturnValue({ isLoading: true, userCardProps: null });

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find('p').props()).toEqual({
      role: 'status',
      children: 'Loading profile...',
    });
    expect(wrapper.find(UserCard).exists()).toBe(false);
  });
});
```

В начале каждого теста вызываю `mockDefault()` — он задаёт исходное состояние моков. Если нужен другой ответ хука, меняю его прямо в Arrange этого теста.

Подготовку сценариев в `beforeEach`, `beforeAll` и уборку за ними в `afterEach`, `afterAll` здесь не прячу. Иначе читаешь тест, а часть условий находится где-то выше, иногда ещё и во вложенных `describe`. Чтобы понять, с какими данными он запускается, приходится собирать всё это по файлу. С `mockDefault()` общая подготовка тоже вынесена в функцию, но её вызов явно стоит в начале теста. Сразу видно, откуда начинать читать и что конкретный сценарий меняет.

Служебную очистку моков и DOM оставляем под капотом, в общих настройках. За сброс моков отвечает [`mockReset: true`](https://vitest.dev/config/mockreset), за очистку DOM — общий `vitest.setup.ts`. В самом тесте остаются три явных шага: подготовили данные — Arrange, выполнили действие — Act, проверили результат — Assert.

Сначала проверили подпись секции и текст заголовка. В React это тоже пропсы элементов: `aria-label` и `children`. Потом нашли именно `UserCard` и сравнили переданные ему пропсы с `userCardProps` из замоканного хука.

В моке специально задаём другое имя — `имя из хука`. Если компонент вместо данных из хука начнёт передавать захардкоженную строку, тест упадёт. TypeScript этот косяк спокойно пропустит: строка же, всё по типам. То, что в карточке оказалось чужое имя, в его картину прекрасного не входит.

В последнем тесте поменяли результат setup-хука: идёт загрузка, пропсов карточки нет. Проверили `role` и `children` у сообщения, а также отсутствие `UserCard`.

`vi.mock('./useSetupProfilePanel')` автоматически подменяет экспортируемый хук мок-функцией. Её ответ задаём через `useSetupProfilePanel.mockReturnValue(...)`. Vitest [поднимает `vi.mock` до импортов](https://vitest.dev/api/vi.html#vi-mock), поэтому панель получает подменённый setup-хук.

У Shallowly здесь узкая работа: выполнить компонент и дать посмотреть на возвращённые React-элементы и их пропсы. Тело `UserCard` он не выполняет, её внутренний `useState` не запускает. Подменён и setup-хук, который при настоящем вызове дошёл бы до `useState` внутри `useProfile`. Это не полный React-рендер; про роль React в вызове компонентов и хуков есть [отдельное пояснение в документации](https://react.dev/reference/rules/react-calls-components-and-hooks).

## А подготовку данных и карточку?

Для `useSetupProfilePanel` есть [два теста через renderHook](https://github.com/bad4iz/unit-test-article/blob/profile-panel-article-v3/examples/profile-panel/src/useSetupProfilePanel.test.jsx). Там подменяется `useProfile` и проверяется, что из готового профиля получаются нужные пропсы, а во время загрузки — признак загрузки и `null` вместо них.

В shallow-тесты панели эта логика не переезжает. Тест компонента отвечает за то, куда попали подготовленные пропсы. Если позже в setup-хуке появится обработчик, его поведение тоже проверяется в тестах хука. В тесте компонента достаточно будет проверить, что функция передана нужному элементу.

В [DOM-тесте](https://github.com/bad4iz/unit-test-article/blob/profile-panel-article-v3/examples/profile-panel/src/ProfilePanel.dom.test.jsx) панель рендерится с настоящими хуками и `UserCard`. Он проверяет, что кнопка карточки раскрывает и скрывает детали. Там уже работает React и меняется DOM. Проверка идёт в jsdom, настоящий браузер не запускается.

## Забрать и запустить

[Полный пример](https://github.com/bad4iz/unit-test-article/tree/profile-panel-article-v3/examples/profile-panel) закреплён тегом `profile-panel-article-v3`, чтобы команды и ссылки не зависели от судьбы рабочей ветки:

```bash
git clone --branch profile-panel-article-v3 --single-branch https://github.com/bad4iz/unit-test-article.git
cd unit-test-article/examples/profile-panel
npm ci
npm test
npm run typecheck
```

Подойдёт Node.js 22 от версии 22.12 или Node.js 24. Версии зависимостей закреплены: React 19.2.4, Shallowly 1.1.1 и Vitest 4.0.18. В примере шесть проверок: три shallow-теста панели, два теста setup-хука и один DOM-тест. Конфиги TypeScript и JSX уже внутри. `npm test` запускает JavaScript-тесты, а `npm run typecheck` проверяет TypeScript-код компонентов, хуков и конфигурации.

Исходный компонент сохранён в `src/ProfilePanel.before.tsx`, результат — в `src/ProfilePanel.tsx` и `src/useSetupProfilePanel.ts`. Можно открыть их рядом и посмотреть, что именно переехало при рефакторинге. Методы Shallowly описаны в [русском справочнике API](https://github.com/bad4iz/shallowly/blob/main/docs/index.ru.md).
