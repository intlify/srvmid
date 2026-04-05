<h1 align="center">@intlify/nitro</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![CI][ci-src]][ci-href]

Internationalization for [Nitro](https://nitro.build/)

## 🌟 Features

✅️️ &nbsp;**Internationalization utils:** support [internationalization
utils](https://github.com/intlify/srvmid/blob/main/packages/nitro/docs/index.md) via [@intlify/utils](https://github.com/intlify/utils)

✅️ &nbsp;**Translation:** Simple API like
[vue-i18n](https://vue-i18n.intlify.dev/)

✅ &nbsp;**Custom locale detector:** You can implement your own locale detector
on server-side

✅ &nbsp;**Nitro plugin:** Optimized for Nitro v3 plugin system

## 💿 Installation

```sh
# Using npm
npm install @intlify/nitro

# Using yarn
yarn add @intlify/nitro

# Using pnpm
pnpm add @intlify/nitro

# Using bun
bun add @intlify/nitro
```

## 🚀 Usage

### Plugin setup

Create a Nitro plugin to enable internationalization:

```ts
// server/plugins/i18n.ts
import { intlify, detectLocaleFromAcceptLanguageHeader } from '@intlify/nitro'

export default intlify({
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
})
```

### Translation

Use `useTranslation` in your route handlers:

```ts
// server/routes/index.ts
import { defineHandler } from 'nitro'
import { useTranslation } from '@intlify/nitro'

export default defineHandler(async event => {
  const t = await useTranslation(event)
  return t('hello', { name: 'Nitro' })
})
```

### Detect locale with utils

Detect locale from `accept-language` header:

```ts
// server/routes/locale.ts
import { defineHandler } from 'nitro'
import { getHeaderLocale } from '@intlify/nitro'

export default defineHandler(event => {
  const locale = getHeaderLocale(event.req)
  return locale.toString()
})
```

## 🛠️ Custom locale detection

You can detect locale with your custom logic from the current HTTP event.

Example for detecting locale from URL query:

```ts
// server/plugins/i18n.ts
import { intlify, getQueryLocale } from '@intlify/nitro'

import type { HTTPEvent } from 'nitro/h3'

const localeDetector = (event: HTTPEvent): string => {
  return getQueryLocale(event.req).toString()
}

export default intlify({
  locale: localeDetector,
  messages: {
    en: { hello: 'Hello {name}!' },
    ja: { hello: 'こんにちは、{name}！' }
  }
})
```

You can also get the detected locale in route handlers with `getDetectorLocale`:

```ts
// server/routes/index.ts
import { defineHandler } from 'nitro'
import { getDetectorLocale } from '@intlify/nitro'

export default defineHandler(async event => {
  const locale = await getDetectorLocale(event)
  return `Current Locale: ${locale.language}`
})
```

You can make that function asynchronous. This is useful when loading resources along with locale detection.

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> The case which a synchronous function returns a promise is not supported. you need to use `async function`.

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

```ts
// server/plugins/i18n.ts
import { intlify, getCookieLocale } from '@intlify/nitro'

import type { HTTPEvent } from 'nitro/h3'
import type { DefineLocaleMessage, CoreContext } from '@intlify/nitro'

const loader = (path: string) => import(path).then(m => m.default)
const messages: Record<string, () => ReturnType<typeof loader>> = {
  en: () => loader('./locales/en.json'),
  ja: () => loader('./locales/ja.json')
}

const localeDetector = async (
  event: HTTPEvent,
  intlify: CoreContext<string, DefineLocaleMessage>
): Promise<string> => {
  const locale = getCookieLocale(event.req).toString()

  const loader = messages[locale]
  if (loader && !intlify.messages[locale]) {
    const message = await loader()
    intlify.messages[locale] = message
  }

  return locale
}

export default intlify({
  locale: localeDetector
})
```

## 🖌️ Resource keys completion

<!-- eslint-disable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

> [!NOTE]
> Resource Keys completion can be used if you are using [Visual Studio Code](https://code.visualstudio.com/)

<!-- eslint-enable markdown/no-missing-label-refs -- NOTE(kazupon): ignore github alert -->

You can completion resources key on translation function with `useTranslation`.

### Type parameter for `useTranslation`

You can set the type parameter to the resource schema for key completion of the translation function:

```ts
// server/routes/index.ts
import { defineHandler } from 'nitro'
import { useTranslation } from '@intlify/nitro'

export default defineHandler(async event => {
  type ResourceSchema = {
    hello: string
  }
  const t = await useTranslation<ResourceSchema>(event)
  return t('hello', { name: 'Nitro' })
})
```

### Global resource schema with `declare module '@intlify/nitro'`

You can do resource key completion with the translation function using the typescript `declare module`:

```ts
import en from './locales/en.ts'

type ResourceSchema = typeof en

declare module '@intlify/nitro' {
  export interface DefineLocaleMessage extends ResourceSchema {}
}
```

The advantage of this way is that it is not necessary to specify the resource schema in the `useTranslation` type parameter.

## 🛠️ Utilities & Helpers

`@intlify/nitro` has a concept of composable utilities & helpers.

See the [API References](https://github.com/intlify/srvmid/blob/main/packages/nitro/docs/index.md)

## 🙌 Contributing guidelines

If you are interested in contributing to `@intlify/nitro`, I highly recommend checking out [the contributing guidelines](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](https://github.com/intlify/srvmid/blob/main/CONTRIBUTING.md#development-setup)) etc., there.

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

[npm-version-src]: https://img.shields.io/npm/v/@intlify/nitro?style=flat&colorA=18181B&colorB=FFAD33
[npm-version-href]: https://npmjs.com/package/@intlify/nitro
[npm-downloads-src]: https://img.shields.io/npm/dm/@intlify/nitro?style=flat&colorA=18181B&colorB=FFAD33
[npm-downloads-href]: https://npmjs.com/package/@intlify/nitro
[ci-src]: https://github.com/intlify/srvmid/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/intlify/srvmid/actions/workflows/ci.yml
