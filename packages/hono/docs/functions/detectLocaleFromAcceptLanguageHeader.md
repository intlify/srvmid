[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / detectLocaleFromAcceptLanguageHeader

# Function: detectLocaleFromAcceptLanguageHeader()

```ts
function detectLocaleFromAcceptLanguageHeader(c): string;
```

locale detection with `Accept-Language` header

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `c` | `Context` | A Hono context |

## Returns

`string`

A locale string, which will be detected of **first** from `Accept-Language` header

## Example

```js
import { Hono } from 'hono'
import { defineIntlifyMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/hono'

const intlify = defineIntlifyMiddleware({
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
app.use('*', intlify)
```
