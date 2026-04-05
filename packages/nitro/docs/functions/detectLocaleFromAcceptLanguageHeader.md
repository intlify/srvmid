[**@intlify/nitro**](../index.md)

---

[@intlify/nitro](../index.md) / detectLocaleFromAcceptLanguageHeader

# Function: detectLocaleFromAcceptLanguageHeader()

```ts
function detectLocaleFromAcceptLanguageHeader(event): string
```

Locale detection with `Accept-Language` header

## Parameters

| Parameter | Type        | Description        |
| --------- | ----------- | ------------------ |
| `event`   | `HTTPEvent` | A Nitro HTTP event |

## Returns

`string`

A locale string, which will be detected of **first** from `Accept-Language` header

## Example

```ts
// server/plugins/i18n.ts
import { intlify, detectLocaleFromAcceptLanguageHeader } from '@intlify/nitro'

export default intlify({
  messages: {
    en: {
      hello: 'Hello {name}!'
    },
    ja: {
      hello: 'こんにちは、{name}！'
    }
  },
  locale: detectLocaleFromAcceptLanguageHeader
})
```
