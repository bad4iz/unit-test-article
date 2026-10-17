<!--
status: draft
created_at: 2026-10-17
habr_url: https://habr.com/ru/articles/1095628/
task_branch: codex/shallowly-practical-article
example: examples/profile-panel
example_ref: profile-panel-article-v2
-->

# React 19, Shallowly и Vitest: отделяем логику от разметки и тестируем пропсы

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

`useProfile` возвращает либо `{ status: 'loading' }`, либо `{ status: 'ready', profile }`. В примере внутри него обычный `useState` с локальным профилем Ada Lovelace. Запросов к бэку здесь нет. `UserCard` принимает `name` и умеет раскрывать детали через свой `useState`.

## Тесты и архитектура

Тесты не должны диктовать архитектуру проекта. Если ради удобства одной библиотеки приходится выворачивать рабочий код наизнанку, я бы сначала посмотрел на сам способ тестирования. Но это не мешает менять архитектуру в лучшую сторону. У более понятного кода и тесты часто получаются проще.

В нашей панели вместе живут разметка и подготовка данных для неё. Сейчас это несколько строк. В рабочем компоненте к ним легко добавляются вычисления, проверки прав, обработка ошибок. Всё это приходится читать вперемешку с JSX. Вынесем подготовку данных в хук, чтобы в компоненте было видно, какие элементы он собирает и что им передаёт.

Если назвать знакомые принципы и приёмы, здесь получается вот что:

- **Separation of Concerns — разделение задач.** Подготовка данных живёт в хуке, разметка — в компоненте. В JSX больше не нужно разбираться в устройстве результата `useProfile`.
- **Single Responsibility Principle — более узкая ответственность.** Изменение разметки относится к компоненту, изменение способа подготовки данных — к setup-хуку. Это разные причины менять код.
- **Инкапсуляция в custom hook.** Хук возвращает то, что нужно конкретной панели: признак загрузки и готовые пропсы карточки. Детали источника данных остаются внутри. Такой вынос логики в custom hooks описан и в [документации React](https://react.dev/learn/reusing-logic-with-custom-hooks).

Идею подсмотрел во Vue 3: собираем подготовку данных и логику компонента в `useSetupProfilePanel`, а в самом компоненте оставляем разметку.

`useSetupProfilePanel` получает состояние профиля и подготавливает пропсы для карточки. Компонент решает, какую разметку показать и куда передать эти пропсы. Поэтому подготовку данных можно проверить отдельно в тестах хука, а в shallow-тестах компонента — проверить разметку и передачу пропсов.

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

Всё нужное достал через деструктуризацию. Сообщение о загрузке, секция, заголовок и карточка остались на месте. Только вместо обращения к `state.profile.name` компонент передаёт в `UserCard` подготовленные пропсы.

Вот и весь рефакторинг: чтение данных и их подготовка ушли в setup-хук, выбор разметки остался в компоненте. Поведение панели то же самое. Такое разделение мне полезно и без тестов. Заодно теперь можно отдельно проверять подготовку данных и отдельно — куда компонент их прокинул.

## Теперь тестируем компонент

Входных пропсов у `ProfilePanel` нет: тест рендерит его как `<ProfilePanel />`. Данные приходят из `useSetupProfilePanel`, а панель передаёт их дальше — в `UserCard` через `userCardProps`. Вот эту передачу и проверим: имя из хука должно попасть в карточку. Заодно проверим заголовок, подпись секции и сообщение о загрузке.

В shallow-тесте замокаю `useSetupProfilePanel` и задам готовый результат. Как хук получил имя и почему решил, что загрузка закончилась, здесь меня не интересует: это проверим отдельно в тестах хука.

`ProfilePanel.shallow.test.tsx` целиком:

```typescript
import { shallow } from 'shallowly';
import { describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useSetupProfilePanel } from './useSetupProfilePanel';

vi.mock('./useSetupProfilePanel', () => ({ useSetupProfilePanel: vi.fn() }));

const mockedSetup = vi.mocked(useSetupProfilePanel);
const userCardProps = { name: 'Grace Hopper' };

const mockDefault = () => {
  mockedSetup.mockReturnValue({ isLoading: false, userCardProps });
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

    //🔥 Act
    const wrapper = shallow(<ProfilePanel />);

    //❓ Assert
    expect(wrapper.find(UserCard).props()).toEqual(userCardProps);
  });

  it('🧪 показывает сообщение о загрузке без карточки', () => {
    expect.hasAssertions();

    //☣️ Arrange
    mockDefault();
    mockedSetup.mockReturnValue({ isLoading: true, userCardProps: null });

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

В начале каждого теста вызываю `mockDefault()`: он задаёт обычный ответ setup-хука. Если нужен другой сценарий, меняю ответ прямо в этом тесте. Подготовка, действие и проверки разнесены по блокам Arrange / Act / Assert.

Сброс моков выполняет Vitest: в конфиге примера включён [`mockReset: true`](https://vitest.dev/config/mockreset). Поэтому ручных сбросов и `beforeEach` в тестовом файле нет.

Сначала проверили подпись секции и текст заголовка. В React это тоже пропсы элементов: `aria-label` и `children`. Потом нашли именно `UserCard` и сравнили переданные ему пропсы с `userCardProps` из замоканного хука.

В данных специально Grace Hopper, а в настоящем `useProfile` лежит Ada Lovelace. Если при правке компонента вместо спреда захардкодить имя, проверка передачи пропсов это заметит. Один только TypeScript такую подмену пропустит: тип по-прежнему `string`.

В последнем тесте поменяли результат setup-хука: идёт загрузка, пропсов карточки нет. Проверили `role` и `children` у сообщения, а также отсутствие `UserCard`. Во всём компоненте не приходится искать строковые снимки разметки и переписывать их из-за каждого нового контейнера.

`vi.mocked` помогает TypeScript с типом мока, а сам модуль подменяет `vi.mock`. Vitest [поднимает этот вызов до импортов](https://vitest.dev/api/vi.html#vi-mock), поэтому панель получает подменённый setup-хук.

У Shallowly здесь узкая работа: выполнить компонент и дать посмотреть на возвращённые React-элементы и их пропсы. Тело `UserCard` он не выполняет, её внутренний `useState` не запускает. Подменён и setup-хук, который при настоящем вызове дошёл бы до `useState` внутри `useProfile`. Это не полный React-рендер; про роль React в вызове компонентов и хуков есть [отдельное пояснение в документации](https://react.dev/reference/rules/react-calls-components-and-hooks).

## А подготовку данных и карточку?

Разделение кода дало и понятные границы проверок. Для `useSetupProfilePanel` рядом есть [два теста через renderHook](https://github.com/bad4iz/unit-test-article/blob/profile-panel-article-v2/examples/profile-panel/src/useSetupProfilePanel.test.tsx). Там подменяется `useProfile` и проверяется, что из готового профиля получаются нужные пропсы, а во время загрузки — признак загрузки и `null` вместо них.

В shallow-тесты панели эта логика не переезжает. Тест компонента отвечает за то, куда попали подготовленные пропсы. Если позже в setup-хуке появится обработчик, его поведение тоже проверяется в тестах хука. В тесте компонента достаточно будет проверить, что функция передана нужному элементу.

В [DOM-тесте](https://github.com/bad4iz/unit-test-article/blob/profile-panel-article-v2/examples/profile-panel/src/ProfilePanel.dom.test.tsx) панель рендерится с настоящими хуками и `UserCard`. Он проверяет, что кнопка карточки раскрывает и скрывает детали. Там уже работает React и меняется DOM. Проверка идёт в jsdom, настоящий браузер не запускается.

Для меня такой расклад понятен: подготовка данных отдельно, разметка отдельно, пользовательское взаимодействие — своей проверкой. В каждом тесте меньше поводов разбираться со всем компонентом сразу.

## Забрать и запустить

[Полный пример](https://github.com/bad4iz/unit-test-article/tree/profile-panel-article-v2/examples/profile-panel) закреплён тегом `profile-panel-article-v2`, чтобы команды и ссылки не зависели от судьбы рабочей ветки:

```bash
git clone --branch profile-panel-article-v2 --single-branch https://github.com/bad4iz/unit-test-article.git
cd unit-test-article/examples/profile-panel
npm ci
npm test
npm run typecheck
```

Подойдёт Node.js 22 от версии 22.12 или Node.js 24. Версии зависимостей закреплены: React 19.2.4, Shallowly 1.1.1 и Vitest 4.0.18. В примере шесть проверок: три shallow-теста панели, два теста setup-хука и один DOM-тест. Конфиги TypeScript и JSX уже внутри.

Исходный компонент сохранён в `src/ProfilePanel.before.tsx`, результат — в `src/ProfilePanel.tsx` и `src/useSetupProfilePanel.ts`. Можно открыть их рядом и посмотреть, что именно переехало при рефакторинге. Методы Shallowly описаны в [русском справочнике API](https://github.com/bad4iz/shallowly/blob/main/docs/index.ru.md).
