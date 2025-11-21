[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / useTranslation

# Function: useTranslation()

```ts
function useTranslation<Schema, HonoContext>(ctx): Promise<TranslationFunction<Schema, DefineLocaleMessage, ResolveResourceKeys<Schema, DefineLocaleMessage, RemoveIndexSignature<{
[key: string]: LocaleMessageValue<string>;
  hello: string;
  nest: {
     foo: {
        bar: string;
     };
  };
}>, IsEmptyObject<Schema> extends false ? ResourcePath<{ [K in string | number | symbol]: Schema[K] }> : never, _ResourcePath<{
  hello: string;
  nest: {
     foo: {
        bar: string;
     };
  };
}>>>>;
```

use translation function in handler

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

`Promise`\<`TranslationFunction`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `ResolveResourceKeys`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `RemoveIndexSignature`\<\{
\[`key`: `string`\]: `LocaleMessageValue`\<`string`\>;
  `hello`: `string`;
  `nest`: \{
     `foo`: \{
        `bar`: `string`;
     \};
  \};
\}\>, `IsEmptyObject`\<`Schema`\> *extends* `false` ? `ResourcePath`\<\{ \[K in string \| number \| symbol\]: Schema\[K\] \}\> : `never`, `_ResourcePath`\<\{
  `hello`: `string`;
  `nest`: \{
     `foo`: \{
        `bar`: `string`;
     \};
  \};
\}\>\>\>\>

Return a translation function, which can be translated with i18n resource messages

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

app.get('/', async (ctx) => {
  const t = await useTranslation(ctx)
  return ctx.text(t('hello', { name: 'hono' }))
})
```
