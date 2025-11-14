[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getHeaderLocales

# Function: getHeaderLocales()

```ts
function getHeaderLocales(context, __namedParameters?): Locale[];
```

get locales from header

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `Context` | A Context \| Hono context |
| `__namedParameters?` | `HeaderOptions` | - |

## Returns

`Locale`[]

Some locales that wrapped from header, if you use `accept-language` header and `*` (any language) or empty string is detected, return an empty array.

## Description

wrap language tags with Intl.Locale \| locale, languages tags will be parsed from `accept-language` header as default.

## Example

example for Hono:

```ts
import { Hono } from 'hono'
import { getHeaderLocales } from '@intlify/utils/hono'

const app = new Hono()
app.use('/', c => {
  const locales = getHeaderLocales(c)
  // ...
  return c.text(`accepted locales: ${locales.map(locale => locale.toString()).join(', ')}`)
})
```
