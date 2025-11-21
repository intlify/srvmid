[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / useTranslation

# Function: useTranslation()

```ts
function useTranslation<Schema, HonoContext>(c): Promise<TranslationFunction<Schema, DefineLocaleMessage, ResolveResourceKeys<Schema, DefineLocaleMessage, RemoveIndexSignature<{
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
| `c` | `HonoContext` | A Hono context |

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

Return a translation function, which can be translated with intlify resource messages

## Example

```js
import { Hono } from 'hono'
import { defineIntlifyMiddleware } from '@intlify/hono'

const intlify = defineIntlifyMiddleware({
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
app.use('*', intlify)
// setup other middlewares ...

app.get('/', async (c) => {
  const t = await useTranslation(c)
  return c.text(t('hello', { name: 'hono' }))
})
```
