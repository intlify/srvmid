# @intlify/hono

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![CI][ci-src]][ci-href]

Internationalization middleware & utilities for [Hono](https://hono.dev/)

## 🌟 Features

✅️️ &nbsp;**Internationalization utilities:** support [internationalization
utils](https://github.com/intlify/srvmid/blob/main/packages/hono/docs/index.md) via [@intlify/utils](https://github.com/intlify/utils)

✅️ &nbsp;**Translation:** Simple API like
[vue-i18n](https://vue-i18n.intlify.dev/)

✅ &nbsp;**Custom locale detector:** You can implement your own locale detector
on server-side

## 💿 Installation

```sh
# Using npm
npm install @intlify/hono

# Using yarn
yarn add @intlify/hono

# Using pnpm
pnpm add @intlify/hono

# Using bun
bun add @intlify/hono
```

## 🚀 Usage

### Detect locale with utils

Detect locale from `accept-language` header:

```ts
import { Hono } from 'hono'
import { getHeaderLocale } from '@intlify/h3'

const app = new Hono()

app.get('/', c => {
  // detect locale from HTTP header which has `Accept-Language: ja,en-US;q=0.7,en;q=0.3`
  const locale = getHeaderLocale(c.req.raw)
  return c.text(locale.toString())
})
```

Detect locale from URL query:

```ts
import { Hono } from 'hono'
import { getQueryLocale } from '@intlify/h3'

const app = new Hono()

app.get('/', c => {
  // detect locale from query which has 'http://localhost:3000?locale=en'
  const locale = getQueryLocale(c.req.raw)
  return c.text(locale.toString())
})
```

### Translation

If you want to use translation, you need to install middleware. As a result, you can use `useTranslation` within the handler:

```ts
import { Hono } from 'hono'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '@intlify/hono'

// define middleware with vue-i18n like options
const i18nMiddleware = defineI18nMiddleware({
  // detect locale with `accept-language` header
  locale: detectLocaleFromAcceptLanguageHeader,
  // resource messages
  messages: {
    en: {
      hello: 'Hello {name}!'
    },
    ja: {
      hello: 'こんにちは、{name}！'
    }
  }
  // something options
  // ...
})

const app = new Hono()

// install middleware with `app.use`
app.use('*', i18nMiddleware)

app.get('/', async c => {
  // use `useTranslation` in handler
  const t = await useTranslation(c)
  return c.text(t('hello', { name: 'hono' }) + `\n`)
})

export default app
```

## 🛠️ Custom locale detection

You can detect locale with your custom logic from current `Context`.

example for detecting locale from url query:

```ts
import { defineI18nMiddleware, getQueryLocale } from '@intlify/hono'
import type { Context } from 'hono'

const DEFAULT_LOCALE = 'en'

// define custom locale detector
const localeDetector = (ctx: Context): string => {
  try {
    return getQueryLocale(ctx.req.raw).toString()
  } catch {
    return DEFAULT_LOCALE
  }
}

const middleware = defineI18nMiddleware({
  // set your custom locale detector
  locale: localeDetector
  // something options
  // ...
})
```

You can make that function asynchronous. This is useful when loading resources along with locale detection.

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The case which a synchronous function returns a promise is not supported. you need to use `async function`.

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

```ts
import { Hono } from 'hono'
import { defineI18nMiddleware, getCookieLocale } from '@intlify/hono'

import type { Context } from 'hono'
import type { DefineLocaleMessage, CoreContext } from '@intlify/h3'

const loader = (path: string) => import(path).then(m => m.default)
const messages: Record<string, () => ReturnType<typeof loader>> = {
  en: () => loader('./locales/en.json'),
  ja: () => loader('./locales/ja.json')
}

// define custom locale detector and lazy loading
const localeDetector = async (
  ctx: Context,
  i18n: CoreContext<string, DefineLocaleMessage>
): Promise<string> => {
  // detect locale
  const locale = getCookieLocale(ctx.req.raw).toString()

  // resource lazy loading
  const loader = messages[locale]
  if (loader && !i18n.messages[locale]) {
    const message = await loader()
    i18n.messages[locale] = message
  }

  return locale
}

const middleware = defineI18nMiddleware({
  // set your custom locale detector
  locale: localeDetector
  // something options
  // ...
})
```

## 🧩 Type-safe resources

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!WARNING]
> **This is experimental feature (inspired from [vue-i18n](https://vue-i18n.intlify.dev/guide/advanced/typescript.html#typescript-support)).**
> We would like to get feedback from you 🙂.

> [!NOTE]
> The exeample code is [here](https://github.com/intlify/hono/tree/main/playground/typesafe-schema)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can support the type-safe resources with schema using TypeScript on `defineI18nMiddleware` options.

Locale messages resource:

```ts
export default {
  hello: 'hello, {name}!'
}
```

your application code:

```ts
import { defineI18nMiddleware } from '@intlify/hono'
import en from './locales/en.ts'

// define resource schema, as 'en' is master resource schema
type ResourceSchema = typeof en

const i18nMiddleware = defineI18nMiddleware<[ResourceSchema], 'en' | 'ja'>({
  messages: {
    en: { hello: 'Hello, {name}' }
  }
  // something options
  // ...
})

// something your implementation code ...
// ...
```

Result of type checking with `tsc`:

```sh
npx tsc --noEmit
index.ts:13:3 - error TS2741: Property 'ja' is missing in type '{ en: { hello: string; }; }' but required in type '{ en: ResourceSchema; ja: ResourceSchema; }'.

13   messages: {
     ~~~~~~~~

  ../../node_modules/@intlify/core/node_modules/@intlify/core-base/dist/core-base.d.ts:125:5
    125     messages?: {
            ~~~~~~~~
    The expected type comes from property 'messages' which is declared here on type 'CoreOptions<string, { message: ResourceSchema; datetime: DateTimeFormat; number: NumberFormat; }, { messages: "en"; datetimeFormats: "en"; numberFormats: "en"; } | { ...; }, ... 8 more ..., NumberFormats<...>>'


Found 1 error in index.ts:13
```

If you are using [Visual Studio Code](https://code.visualstudio.com/) as an editor, you can notice that there is a resource definition omission in the editor with the following error before you run the typescript compilation.

![Type-safe resources](assets/typesafe-schema.png)

## 🖌️ Resource keys completion

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> Resource Keys completion can be used if you are using [Visual Studio Code](https://code.visualstudio.com/)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can completion resources key on translation function with `useTranslation`.

![Key Completion](assets/key-completion.gif)

resource keys completion has twe ways.

### Type parameter for `useTranslation`

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The exeample code is [here](https://github.com/intlify/hono/tree/main/playground/local-schema)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can `useTranslation` set the type parameter to the resource schema you want to key completion of the translation function.

the part of example:

```ts
app.get('/', async c => {
  type ResourceSchema = {
    hello: string
  }
  // set resource schema as type parameter
  const t = await useTranslation<ResourceSchema>(c)
  // you can completion when you type `t('`
  return c.json(t('hello', { name: 'hono' }))
})
```

### global resource schema with `declare module '@intlify/hono'`

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The exeample code is [here](https://github.com/intlify/hono/tree/main/playground/global-schema)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can do resource key completion with the translation function using the typescript `declare module`.

the part of example:

```ts
import en from './locales/en.ts'

// 'en' resource is master schema
type ResourceSchema = typeof en

// you can put the type extending with `declare module` as global resource schema
declare module '@intlify/hono' {
  // extend `DefineLocaleMessage` with `ResourceSchema`
  export interface DefineLocaleMessage extends ResourceSchema {}
}

app.get('/', async c => {
  const t = await useTranslation(c)
  // you can completion when you type `t('`
  return c.json(t('hello', { name: 'hono' }))
})
```

The advantage of this way is that it is not necessary to specify the resource schema in the `useTranslation` type parameter.

## 🛠️ Utilities & Helpers

`@intlify/hono` has a concept of composable utilities & helpers.

See the [API References](https://github.com/intlify/srvmid/blob/main/packages/hono/docs/index.md)

## 🙌 Contributing guidelines

If you are interested in contributing to `@intlify/hono`, I highly recommend checking out [the contributing guidelines](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#development-setup) etc., there.

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@intlify/hono?style=flat&colorA=18181B&colorB=FFAD33
[npm-version-href]: https://npmjs.com/package/@intlify/hono
[npm-downloads-src]: https://img.shields.io/npm/dm/@intlify/hono?style=flat&colorA=18181B&colorB=FFAD33
[npm-downloads-href]: https://npmjs.com/package/@intlify/hono
[ci-src]: https://github.com/intlify/srvmid/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/intlify/srvmid/actions/workflows/ci.yml
