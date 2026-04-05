[**@intlify/nitro**](../index.md)

---

[@intlify/nitro](../index.md) / useTranslation

# Function: useTranslation()

```ts
function useTranslation<Schema, Event>(
  event
): Promise<
  TranslationFunction<
    Schema,
    DefineLocaleMessage,
    ResolveResourceKeys<
      Schema,
      DefineLocaleMessage,
      RemoveIndexSignature<{
        [key: string]: LocaleMessageValue<string>
        test: string
      }>,
      IsEmptyObject<Schema> extends false
        ? ResourcePath<{ [K in string | number | symbol]: Schema[K] }>
        : never,
      'test'
    >
  >
>
```

Use translation function in event handler

## Type Parameters

| Type Parameter                                         | Default type                         |
| ------------------------------------------------------ | ------------------------------------ |
| `Schema` _extends_ `Record`\<`string`, `any`\>         | `object`                             |
| `Event` _extends_ `HTTPEvent`\<`EventHandlerRequest`\> | `HTTPEvent`\<`EventHandlerRequest`\> |

## Parameters

| Parameter | Type    | Description        |
| --------- | ------- | ------------------ |
| `event`   | `Event` | A Nitro HTTP event |

## Returns

`Promise`\<`TranslationFunction`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `ResolveResourceKeys`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `RemoveIndexSignature`\<\{
\[`key`: `string`\]: `LocaleMessageValue`\<`string`\>;
`test`: `string`;
\}\>, `IsEmptyObject`\<`Schema`\> _extends_ `false` ? `ResourcePath`\<\{ \[K in string \| number \| symbol\]: Schema\[K\] \}\> : `never`, `"test"`\>\>\>

Return a translation function, which can be translated with internationalization resource messages

## Example

```ts
import { defineHandler } from 'nitro/h3'
import { useTranslation } from '@intlify/nitro'

export default defineHandler(async event => {
  const t = await useTranslation(event)
  return t('hello', { name: 'Nitro' })
})
```
