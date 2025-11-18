# @intlify/elysia

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![CI][ci-src]][ci-href]

Internationalization for [Elysia](https://elysiajs.com/)

## 🌟 Features

✅️️ &nbsp;**Internationalization utilities:** support [internationalization
utils](https://github.com/intlify/srvmid/blob/main/packages/elysia/docs/index.md) via [@intlify/utils](https://github.com/intlify/utils)

✅️ &nbsp;**Translation:** Simple API like
[vue-i18n](https://vue-i18n.intlify.dev/)

✅ &nbsp;**Custom locale detector:** You can implement your own locale detector
on server-side

## 💿 Installation

```sh
# Using npm
npm install @intlify/elysia

# Using yarn
yarn add @intlify/elysia

# Using pnpm
pnpm add @intlify/elysia

# Using bun
bun add @intlify/elysia
```

## 🚀 Usage

### Detect locale with utils

Detect locale from `accept-language` header:

```ts
import { Elysia } from 'elysia'
import { getHeaderLocale } from '@intlify/elysia'

new Elysia().get('/', ctx => {
  // detect locale from HTTP header which has `Accept-Language: ja,en-US;q=0.7,en;q=0.3`
  const locale = getHeaderLocale(ctx.request)
  return locale.toString()
})
```

Detect locale from URL query:

```ts
import { Elysia } from 'elysia'
import { getQueryLocale } from '@intlify/elysia'

new Elysia().get('/', ctx => {
  // detect locale from query which has 'http://localhost:3000?locale=en'
  const locale = getQueryLocale(ctx.request)
  return locale.toString()
})
```

### Translation

+If you want to use translation, you need to install plugin. As a result, `locale` property and `translation` function will be extended in Elysia Context:

```ts
import { Elysia } from 'elysia'
import { detectLocaleFromAcceptLanguageHeader, intlify } from '@intlify/elysia'

const app = new Elysia()
  .use(
    // configure plugin options like vue-i18n
    intlify({
      // detect locale with `accept-language` header
      locale: detectLocaleFromAcceptLanguageHeader,
      // resource messages
      messages: {
        en: {
          hello: 'hello, {name}'
        },
        ja: {
          hello: 'こんにちは, {name}'
        }
      }
      // something options
      // ...
    })
  )
  .get('/', ctx => {
    // use `locale` property in handler
    console.log('current locale', ctx.locale)
    // use `translation` function in handler
    return ctx.translate('hello', { name: 'elysia' })
  })

export default app
```

## 🛠️ Custom locale detection

You can detect locale with your custom logic from current `Context`.

example for detecting locale from url query:

```ts
import { Elysia } from 'elysia'
import { getQueryLocale, intlify } from '@intlify/elysia'

import type { Context } from 'elysia'

const DEFAULT_LOCALE = 'en'

// define custom locale detector
const localeDetector = (ctx: Context): string => {
  try {
    return getQueryLocale(ctx.request).toString()
  } catch {
    return DEFAULT_LOCALE
  }
}

new Elysia().use(
  intlify({
    // set your custom locale detector
    locale: localeDetector
    // something options
    // ...
  })
)
```

You can make that function asynchronous. This is useful when loading resources along with locale detection.

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The case which a synchronous function returns a promise is not supported. you need to use `async function`.

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

```ts
import { Elysia } from 'elysia'
import { intlify, getCookieLocale } from '@intlify/elysia'

import type { Context } from 'elysia'
import type { DefineLocaleMessage, CoreContext } from '@intlify/elysia'

// loader for resources
const loader = (path: string) => import(path, { with: { type: 'json' } }).then(m => m.default)
const messages: Record<string, () => ReturnType<typeof loader>> = {
  en: () => loader('./locales/en.json'),
  ja: () => loader('./locales/ja.json')
}

// define custom locale detector and lazy loading
const localeDetector = async (
  ctx: Context,
  intlify: CoreContext<string, DefineLocaleMessage>
): Promise<string> => {
  // detect locale
  const locale = getCookieLocale(ctx.request).toString()

  // resource lazy loading
  const loader = messages[locale]
  if (loader && !intlify.messages[locale]) {
    const message = await loader()
    intlify.messages[locale] = message
  }

  return locale
}

new Elysia().use(
  intlify({
    // set your custom locale detector
    locale: localeDetector
    // something options
    // ...
  })
)
```

## 🖌️ Resource keys completion

resource keys completion has twe ways.

### Type parameter for `intlify` plugin

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The example code is [here](https://github.com/intlify/elysia/tree/main/playground/local-schema)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can set the type parameter of `intlify` plugin to the resource schema you want to key completion of the `translation` function.

the part of example:

```ts
type ResourceSchema = {
  hello: string
}

new Elysia()
  .use(
    // you can put the type extending with type argument of plugin as locale resource schema
    intlify<ResourceSchema>({
      // something options ...
    })
  )
  .get('/', ctx => {
    // you can completion when you type `ctx.translate('`
    return ctx.translate('hi', { name: 'elysia' })
  })
```

### global resource schema with `declare module '@intlify/elysia'`

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The exeample code is [here](https://github.com/intlify/elysia/tree/main/playground/global-schema)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can do resource key completion with the translation function using the typescript `declare module`.

the part of example:

```ts
import en from './locales/en.ts'

// 'en' resource is master schema
type ResourceSchema = typeof en

// you can put the type extending with `declare module` as global resource schema
declare module '@intlify/elysia' {
  // extend `DefineLocaleMessage` with `ResourceSchema`
  export interface DefineLocaleMessage extends ResourceSchema {}
}

new Elysia()
  .use(
    intlify({
      // something options ...
    })
  )
  .get('/', ctx => {
    // you can completion when you type `ctx.translate('`
    return ctx.translate('hello', { name: 'elysia' })
  })
```

The advantage of this way is that it is not necessary to specify the resource schema in the plugin `intlify`.

## 🛠️ Utilities & Helpers

`@intlify/elysia` has a concept of composable utilities & helpers.

See the [API References](https://github.com/intlify/srvmid/blob/main/packages/elysia/docs/index.md)

## 🙌 Contributing guidelines

If you are interested in contributing to `@intlify/elysia`, I highly recommend checking out [the contributing guidelines](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#development-setup) etc., there.

## 🤝 Sponsors

The development of `srvmid` is supported by my OSS sponsors!

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/kazupon/sponsors/sponsors.svg">
    <img alt="sponsor" src='https://cdn.jsdelivr.net/gh/kazupon/sponsors/sponsors.svg'/>
  </a>
</p>

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@intlify/elysia?style=flat&colorA=18181B&colorB=FFAD33
[npm-version-href]: https://npmjs.com/package/@intlify/elysia
[npm-downloads-src]: https://img.shields.io/npm/dm/@intlify/elysia?style=flat&colorA=18181B&colorB=FFAD33
[npm-downloads-href]: https://npmjs.com/package/@intlify/elysia
[ci-src]: https://github.com/intlify/srvmid/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/intlify/srvmid/actions/workflows/ci.yml
