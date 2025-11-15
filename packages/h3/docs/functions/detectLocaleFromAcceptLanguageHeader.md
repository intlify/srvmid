[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / detectLocaleFromAcceptLanguageHeader

# Function: detectLocaleFromAcceptLanguageHeader()

```ts
function detectLocaleFromAcceptLanguageHeader(event): string;
```

Locale detection with `Accept-Language` header

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | A H3 event |

## Returns

`string`

A locale string, which will be detected of **first** from `Accept-Language` header

## Example

```js
import { H3 } from 'h3'
import { defineI18nMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/h3'

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

const app = new H3()
  .use(i18nMiddleware.onRequest)
  .use(i18nMiddleware.onResponse)
```
