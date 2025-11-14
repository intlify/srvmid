[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / useTranslation

# Function: useTranslation()

```ts
function useTranslation<Schema, HonoContext>(ctx): TranslationFunction<Schema, DefineLocaleMessage>;
```

use translation function in event handler

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Schema` *extends* `Record`\<`string`, `any`\> | `object` |
| `HonoContext` *extends* `Context`\<`any`, `any`, \{ \}\> | `Context`\<`any`, `any`, \{ \}\> |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ctx` | `HonoContext` | A Hono context |

## Returns

`TranslationFunction`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md)\>

Return a translation function, which can be translated with i18n resource messages

## Description

This function must be initialized with defineI18nMiddleware. See about the [defineI18nMiddleware](defineI18nMiddleware.md)

## Example

```js
import { Hono } from 'hono'
import { defineI18nMiddleware } from '@intlify/hono'

const i18nMiddleware = defineI18nMiddleware({
  messages: {
    en: {
      hello: 'Hello {name}!',
    },
    ja: {
      hello: 'こんにちは、{name}！',
    },
  },
})

const app = new Hono()
app.use('*', i18nMiddleware)
// setup other middlewares ...

app.get('/', (ctx) => {
  const t = useTranslation(ctx)
  return ctx.text(t('hello', { name: 'hono' }))
})
```
