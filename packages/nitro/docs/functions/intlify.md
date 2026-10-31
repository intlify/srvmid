[**@intlify/nitro**](../index.md)

***

[@intlify/nitro](../index.md) / intlify

# Function: intlify()

```ts
function intlify<Schema, Locales, Message, Options>(options): NitroAppPlugin;
```

Internationalization plugin for Nitro

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Schema` | `RemoveIndexSignature`\<\{ \[`key`: `string`\]: `LocaleMessageValue`\<`string`\>; `test`: `string`; \}\> |
| `Locales` | `string` |
| `Message` | `string` |
| `Options` *extends* `CoreOptions`\<`Message`, `SchemaParams`\<`Schema`, `Message`\>, `LocaleParams`\<`Locales`\>, `LocaleParams`\<`Locales`\> *extends* `object` ? `M` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> *extends* `object` ? `D` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> *extends* `object` ? `N` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `M` : `LocaleMessage`\<`string`\>, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `D` : `DateTimeFormat`, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `N` : `NumberFormat`, `LocaleMessages`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `M` : `LocaleMessage`\<`string`\>, `LocaleParams`\<`Locales`\> *extends* `object` ? `M` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `Message`\>, `DateTimeFormats`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `D` : `DateTimeFormat`, `LocaleParams`\<`Locales`\> *extends* `object` ? `D` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>, `NumberFormats`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `N` : `NumberFormat`, `LocaleParams`\<`Locales`\> *extends* `object` ? `N` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>\> | `CoreOptions`\<`Message`, `SchemaParams`\<`Schema`, `Message`\>, `LocaleParams`\<`Locales`\>, `LocaleParams`\<`Locales`\> *extends* `object` ? `M` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> *extends* `object` ? `D` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> *extends* `object` ? `N` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `M` : `LocaleMessage`\<`string`\>, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `D` : `DateTimeFormat`, `SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `N` : `NumberFormat`, `LocaleMessages`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `M` : `LocaleMessage`\<`string`\>, `LocaleParams`\<`Locales`\> *extends* `object` ? `M` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `Message`\>, `DateTimeFormats`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `D` : `DateTimeFormat`, `LocaleParams`\<`Locales`\> *extends* `object` ? `D` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>, `NumberFormats`\<`SchemaParams`\<`Schema`, `Message`\> *extends* `object` ? `N` : `NumberFormat`, `LocaleParams`\<`Locales`\> *extends* `object` ? `N` : `LocaleParams`\<`Locales`\> *extends* `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>\> |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `Options` | An `i18n` options like vue-i18n [`createI18n`]([https://vue-i18n.intlify.dev/guide/#javascript](https://vue-i18n.intlify.dev/guide/#javascript)), which are passed to `createCoreContext` of `@intlify/core` |

## Returns

`NitroAppPlugin`

A Nitro plugin that registers internationalization hooks

## Example

```ts
// server/plugins/i18n.ts
import { intlify } from '@intlify/nitro'

export default intlify({
  messages: {
    en: {
      hello: 'Hello {name}!',
    },
    ja: {
      hello: 'こんにちは、{name}！',
    },
  },
  locale: (event) => {
    // your locale detection logic here
  },
})
```
