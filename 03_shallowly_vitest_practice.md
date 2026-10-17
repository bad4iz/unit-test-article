<!--
status: draft
created_at: 2026-10-17
task_branch: codex/shallowly-practical-article
example: examples/profile-panel
-->

# React 19, Shallowly и Vitest: тестируем props, хуки и callbacks

Есть довольно бесячий класс багов: карточка выглядит нормально, кнопка нажимается, а наверх уезжает имя пользователя вместо его id. TypeScript доволен: и то и другое — `string`. Если бэк ещё замокан, можно какое-то время вообще не замечать подмены.

В [прошлой статье](https://habr.com/ru/articles/927596/) я показал короткий тест с передачей пропсов. Теперь возьму компонент с хуком и несколькими ветками, проверю его через свою библиотеку [Shallowly](https://www.npmjs.com/package/shallowly), а затем добавлю проверку через DOM. На одном примере будет видно, какой косяк ловит каждый тест.

## Сначала запустим

Весь пример лежит [в репозитории статьи](https://github.com/bad4iz/unit-test-article/tree/codex/shallowly-practical-article/examples/profile-panel). Можно сразу забрать и прогнать:

```bash
git clone --branch codex/shallowly-practical-article --single-branch https://github.com/bad4iz/unit-test-article.git
cd unit-test-article/examples/profile-panel
npm ci
npm test
npm run typecheck
```

Для этого примера подойдёт Node.js 22 от версии 22.12 или Node.js 24. Версии зависимостей зафиксированы: React 19.2.4, Shallowly 1.1.1, Vitest 4.0.18. В проекте два файла с тестами: пять изолированных проверок и две через DOM. Настройка TypeScript и JSX уже внутри, руками собирать конфиг не придётся.

## Панель профиля и её работа

Компонент небольшой. Пока профиль грузится, показывает сообщение. Когда данные готовы — передаёт имя в `UserCard`. При выборе карточки вызывает внешний обработчик с id пользователя.

`ProfilePanel.tsx`:

```tsx
import { UserCard } from './UserCard';
import { useProfile } from './useProfile';

export interface ProfilePanelProps {
  onProfileSelected: (profileId: string) => void;
}

export function ProfilePanel({ onProfileSelected }: ProfilePanelProps) {
  const state = useProfile();

  if (state.status === 'loading') {
    return <p role="status">Loading profile...</p>;
  }

  return (
    <section aria-label="Profile">
      <h1>Your profile</h1>
      <UserCard name={state.profile.name} onSelect={() => onProfileSelected(state.profile.id)} />
    </section>
  );
}
```

Сама карточка умеет раскрывать детали через `useState` и содержит кнопку `Select profile`. Её исходник — [UserCard.tsx](https://github.com/bad4iz/unit-test-article/blob/codex/shallowly-practical-article/examples/profile-panel/src/UserCard.tsx). Для теста панели меня пока интересуют две вещи: какое имя в карточку прилетело и какой обработчик ей передали. До кнопок дойдём в DOM-тесте.

Хук `useProfile` в этом учебном проекте хранит локальные данные через `useState`. Он сразу возвращает профиль Ada Lovelace. Запросов к серверу здесь нет: возня с API только раздула бы пример. Состояний у хука два:

```ts
export type ProfileState = { status: 'loading' } | { status: 'ready'; profile: Profile };
```

У `Profile` есть `id` и `name`, оба — строки. Их намеренно легко перепутать, при этом проверка типов ничего не заметит.

## Замокаем хук, карточку оставим

Shallowly выполняет компонент под тестом и даёт посмотреть на возвращённые React-элементы. Внутрь дочерних компонентов он не заходит. Поэтому `UserCard` здесь останется элементом с пропсами, а его `useState` вообще не запустится.

С `useProfile` другая история: его вызывает сама панель. Для такого теста я подменяю результат хука. Shallowly не создаёт окружение для настоящего React-состояния и эффектов; без подмены этот вызов `useState` работать не будет. Про то, почему вызов компонента и React-рендер — разные вещи, есть [пояснение в документации React](https://react.dev/reference/rules/react-calls-components-and-hooks).

Начало `ProfilePanel.shallow.test.tsx`:

```tsx
import { shallow } from 'shallowly';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';
import { UserCard } from './UserCard';
import { useProfile } from './useProfile';

vi.mock('./useProfile', () => ({ useProfile: vi.fn() }));

const mockedUseProfile = vi.mocked(useProfile);

beforeEach(() => {
  mockedUseProfile.mockReset();
  mockedUseProfile.mockReturnValue({
    status: 'ready',
    profile: { id: 'grace', name: 'Grace Hopper' },
  });
});
```

Карточку я не мокал. Заменил только модуль хука и перед каждым тестом задаю его результат. В тестовых данных специально другой пользователь: так будет видно, если панель перестанет брать имя из хука и начнёт возвращать захардкоженное значение.

`vi.mocked` здесь помогает TypeScript понять тип мока; саму подмену делает `vi.mock`. Vitest [поднимает этот вызов до импортов](https://vitest.dev/api/vi.html#vi-mock), поэтому импортированный `ProfilePanel` тоже получит подменённый `useProfile`.

Дальше идут обычные `it` — в файле они собраны в один `describe`.

## Проверяем имя и callback

Сначала пропсы карточки:

```tsx
it('передаёт имя из хука в карточку', () => {
  const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

  expect(wrapper.find(UserCard).props()).toEqual({
    name: 'Grace Hopper',
    onSelect: expect.any(Function),
  });
});
```

В `find` передаю сам `UserCard`. Получаю его пропсы и проверяю, что панель передала нужное имя и функцию выбора. Никакого DOM для этого не понадобилось.

Теперь тот самый случай с id:

```tsx
it('передаёт id выбранного профиля в родительский callback', () => {
  const onProfileSelected = vi.fn();
  const wrapper = shallow(<ProfilePanel onProfileSelected={onProfileSelected} />);
  const onSelect: unknown = wrapper.find(UserCard).prop('onSelect');

  if (typeof onSelect !== 'function') {
    throw new TypeError('Ожидалась функция UserCard.onSelect');
  }

  onSelect();

  expect(onProfileSelected).toHaveBeenCalledExactlyOnceWith('grace');
});
```

Вытащил переданную функцию, вызвал, проверил аргумент. `unknown` и проверка `typeof` нужны, чтобы не затыкать TypeScript через `any`: из обёртки мы достаём проп по имени, его ещё надо проверить перед вызовом.

Здесь никто не нажимает кнопку. Проверяется функция, которую **панель передала карточке**. Вызовет ли карточка эту функцию при клике — отдельный вопрос, до него сейчас дойдём.

Если в панели подменить аргумент на имя:

```tsx
onSelect={() => onProfileSelected(state.profile.name)}
```

типизация это пропустит, а тест будет ждать `grace` и получит `Grace Hopper`. Вот ради такой ошибки и писалась проверка.

## Пока грузится, карточки быть не должно

Для следующего сценария достаточно поменять результат мока:

```tsx
it('показывает загрузку вместо карточки', () => {
  mockedUseProfile.mockReturnValue({ status: 'loading' });

  const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

  expect(wrapper.textInline()).toBe('<p>Loading profile...</p>');
  expect(wrapper.find('p').prop('role')).toBe('status');
  expect(wrapper.find(UserCard).exists()).toBe(false);
});
```

`textInline()` даёт компактное представление элементов. Это удобно для короткой ветки вроде этой. Отдельно проверяю `role`, потому что в такую строку атрибуты не попадают.

Состояние `loading` я выставил сам. Этот тест не проверяет, закончится ли загрузка и обновит ли React экран. Его задача уже: при таком результате хука панель должна вернуть сообщение, а не карточку.

Весь большой компонент в строку для сравнения я бы без необходимости не превращал. Добавишь лишний контейнер — придётся править ожидание, даже если нужное поведение осталось прежним. Здесь всего один `p`, а имя и callback мы выше проверили отдельно.

В примере есть ещё короткая проверка самой границы:

```tsx
it('оставляет UserCard на границе, не выполняя его useState', () => {
  const wrapper = shallow(<ProfilePanel onProfileSelected={vi.fn()} />);

  expect(wrapper.find(UserCard).textInline()).toBe('<UserCard />');
  expect(wrapper.find('button').exists()).toBe(false);
});
```

В исходнике `UserCard` кнопки есть. В результате этого shallow-рендера их нет: тело карточки не выполнялось. Это полезно один раз увидеть руками, чтобы потом не пытаться через `find('button')` достать кнопку из её внутренностей.

## А кнопку кто проверит

Представим, что в самой карточке забыли повесить `onSelect` на кнопку. Все предыдущие проверки панели продолжат проходить. Панель свою часть работы выполнила: передала функцию. Потеряли её уже дальше.

Для этой связи нужен рендер с настоящим `UserCard`. В соседнем файле `ProfilePanel.dom.test.tsx` использую React Testing Library и `user-event`. Хук здесь тоже настоящий, поэтому профиль снова Ada, а не Grace.

```tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { ProfilePanel } from './ProfilePanel';

afterEach(cleanup);

it('раскрывает и скрывает детали карточки по нажатию кнопки', async () => {
  const user = userEvent.setup();
  render(<ProfilePanel onProfileSelected={vi.fn()} />);

  expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeTruthy();
  expect(screen.queryByText('Profile details')).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Show details' }));
  expect(screen.getByText('Profile details')).toBeTruthy();

  await user.click(screen.getByRole('button', { name: 'Hide details' }));
  expect(screen.queryByText('Profile details')).toBeNull();
});

it('передаёт id профиля после нажатия Select profile', async () => {
  const user = userEvent.setup();
  const onProfileSelected = vi.fn();
  render(<ProfilePanel onProfileSelected={onProfileSelected} />);

  await user.click(screen.getByRole('button', { name: 'Select profile' }));

  expect(onProfileSelected).toHaveBeenCalledExactlyOnceWith('ada');
});
```

В конфиге по умолчанию стоит окружение `node`; комментарий в начале этого файла включает `jsdom`. Shallow-тесты и DOM-тесты разнесены, подмена `useProfile` остаётся в первом файле.

Теперь React выполняет карточку, у неё работает `useState`, после клика меняется содержимое DOM. `user-event` [моделирует взаимодействие пользователя](https://testing-library.com/docs/user-event/intro/), поэтому здесь проверяется путь от кнопки до обработчика. Браузер при этом не запускается: это DOM-тест в jsdom, не E2E.

Именно этот тест упадёт, если забыть `onClick={onSelect}` у кнопки выбора. Для проверки одного аргумента в родительском callback мне не нужен весь этот путь. А для проверки самой связи с кнопкой он как раз нужен.

## Что я бы забрал в рабочий проект

Начал бы с компонента, у которого есть понятное ветвление, несколько пропсов для дочернего компонента и обработчик. Так проще увидеть пользу изоляции и понять её цену. В нашем примере цена небольшая: один замоканный хук. Если для двух проверок получается простыня из двадцати моков, стоит ещё раз посмотреть, удачно ли выбрана граница теста и сколько всего делает компонент.

Мне от теста панели нужен конкретный ответ: при таких данных она передала такое имя, показала нужную ветку и вызвала обработчик с нужным id. Для состояния карточки и её кнопок рядом есть DOM-проверки.

Если хочется повторить на своём компоненте, [Shallowly ставится из npm](https://www.npmjs.com/package/shallowly), а методы обёртки описаны в [русском справочнике API](https://github.com/bad4iz/shallowly/blob/main/docs/index.ru.md).

Для начала можно специально сломать этот пример: передать имя вместо id, затем вернуть id и убрать `onClick` у кнопки выбора. Прогон хорошо показывает, какую часть работы проверяет каждый файл.
