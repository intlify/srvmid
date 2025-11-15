[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / detectLocaleFromAcceptLanguageHeader

# Function: detectLocaleFromAcceptLanguageHeader()

```ts
function detectLocaleFromAcceptLanguageHeader(ctx): string;
```

locale detection with `Accept-Language` header

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ctx` | `Context` | A Hono context |

## Returns

`string`

A locale string, which will be detected of **first** from `Accept-Language` header

## Example

```js
import { Hono } from 'hono'
import { defineI18nMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/hono'

const i18nMiddleware = defineI18nMiddleware({
  messages: {
    en: {
      hello: 'Hello {name}!',
    },
    ja: {
      hello: 'こんにちは、{name}！',
    },
  },
  locale: detectLocaleFromAcceptLanguageHeader
})

const app = new Hono()
app.use('*', i18nMiddleware)
```
