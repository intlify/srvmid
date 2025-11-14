[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getCookieLocale

# Function: getCookieLocale()

```ts
function getCookieLocale(context, __namedParameters?): Locale;
```

get locale from cookie

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `Context` | A Context \| Hono context |
| `__namedParameters?` | \{ `lang?`: `string`; `name?`: `string`; \} | - |
| `__namedParameters.lang?` | `string` | - |
| `__namedParameters.name?` | `string` | - |

## Returns

`Locale`

The locale that resolved from cookie

## Example

example for Hono:

```ts
import { Hono } from 'hono'
import { getCookieLocale } from '@intlify/utils/hono'

const app = new Hono()
app.use('/', c => {
  const locale = getCookieLocale(c)
  console.log(locale) // output `Intl.Locale` instance
  // ...
})
```

## Throws

Throws a RangeError if `lang` option or cookie name value are not a well-formed BCP 47 language tag.
