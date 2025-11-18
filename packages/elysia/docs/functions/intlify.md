[**@intlify/elysia**](../index.md)

---

[@intlify/elysia](../index.md) / intlify

# Function: intlify()

```ts
function intlify<Schema, Locales, Message, Options>(
  options
): Elysia<
  '',
  {
    decorator: object & object
    derive: {}
    resolve: {
      translate: TranslationFunction<
        Schema,
        DefineLocaleMessage,
        ResolveResourceKeys<
          Schema,
          DefineLocaleMessage,
          RemoveIndexSignature<{
            [key: string]: LocaleMessageValue<string>
            hello: string
            nest: {
              foo: {
                bar: string
              }
            }
          }>,
          IsEmptyObject<Schema> extends false
            ? ResourcePath<{ [K in string | number | symbol]: Schema[K] }>
            : never,
          _ResourcePath<{
            hello: string
            nest: {
              foo: {
                bar: string
              }
            }
          }>
        >
      >
    }
    store: {}
  },
  {
    error: {}
    typebox: {}
  },
  {
    macro: {}
    macroFn: {}
    parser: {}
    response: UnionResponseStatus<Metadata['response'], ExtractErrorFromHandle<Resolver>>
    schema: {}
    standaloneSchema: {}
  },
  {},
  {
    derive: {}
    resolve: {}
    response: {}
    schema: {}
    standaloneSchema: {}
  },
  {
    derive: {}
    resolve: {}
    response: {}
    schema: {}
    standaloneSchema: {}
  }
>
```

Internationalization plugin for Elysia

## Type Parameters

| Type Parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Default type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Schema` _extends_ `Record`\<`string`, `any`\>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `RemoveIndexSignature`\<\{ \[`key`: `string`\]: `LocaleMessageValue`\<`string`\>; `hello`: `string`; `nest`: \{ `foo`: \{ `bar`: `string`; \}; \}; \}\>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `Locales`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Message`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Options` _extends_ `CoreOptions`\<`Message`, `SchemaParams`\<`Schema`, `Message`\>, `LocaleParams`\<`Locales`\>, `LocaleParams`\<`Locales`\> _extends_ `object` ? `M` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `D` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `N` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `M` : `LocaleMessage`\<`string`\>, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `D` : `DateTimeFormat`, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `N` : `NumberFormat`, `LocaleMessages`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `M` : `LocaleMessage`\<`string`\>, `LocaleParams`\<`Locales`\> _extends_ `object` ? `M` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `Message`\>, `DateTimeFormats`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `D` : `DateTimeFormat`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `D` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>, `NumberFormats`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `N` : `NumberFormat`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `N` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>\> | `CoreOptions`\<`Message`, `SchemaParams`\<`Schema`, `Message`\>, `LocaleParams`\<`Locales`\>, `LocaleParams`\<`Locales`\> _extends_ `object` ? `M` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `D` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `N` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `M` : `LocaleMessage`\<`string`\>, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `D` : `DateTimeFormat`, `SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `N` : `NumberFormat`, `LocaleMessages`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `M` : `LocaleMessage`\<`string`\>, `LocaleParams`\<`Locales`\> _extends_ `object` ? `M` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`, `Message`\>, `DateTimeFormats`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `D` : `DateTimeFormat`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `D` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>, `NumberFormats`\<`SchemaParams`\<`Schema`, `Message`\> _extends_ `object` ? `N` : `NumberFormat`, `LocaleParams`\<`Locales`\> _extends_ `object` ? `N` : `LocaleParams`\<`Locales`\> _extends_ `string` ? `string` & `LocaleParams`\<`Locales`\> : `string`\>\> |

## Parameters

| Parameter | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | `Options` | An internationalization options like vue-i18n [`createI18n`](<[https://vue-i18n.intlify.dev/guide/#javascript](https://vue-i18n.intlify.dev/guide/#javascript)>), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216) |

## Returns

`Elysia`\<`""`, \{
`decorator`: `object` & `object`;
`derive`: \{
\};
`resolve`: \{
`translate`: `TranslationFunction`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `ResolveResourceKeys`\<`Schema`, [`DefineLocaleMessage`](../interfaces/DefineLocaleMessage.md), `RemoveIndexSignature`\<\{
\[`key`: `string`\]: `LocaleMessageValue`\<`string`\>;
`hello`: `string`;
`nest`: \{
`foo`: \{
`bar`: `string`;
\};
\};
\}\>, `IsEmptyObject`\<`Schema`\> _extends_ `false` ? `ResourcePath`\<\{ \[K in string \| number \| symbol\]: Schema\[K\] \}\> : `never`, `_ResourcePath`\<\{
`hello`: `string`;
`nest`: \{
`foo`: \{
`bar`: `string`;
\};
\};
\}\>\>\>;
\};
`store`: \{
\};
\}, \{
`error`: \{
\};
`typebox`: \{
\};
\}, \{
`macro`: \{
\};
`macroFn`: \{
\};
`parser`: \{
\};
`response`: `UnionResponseStatus`\<`Metadata`\[`"response"`\], `ExtractErrorFromHandle`\<`Resolver`\>\>;
`schema`: \{
\};
`standaloneSchema`: \{
\};
\}, \{
\}, \{
`derive`: \{
\};
`resolve`: \{
\};
`response`: \{
\};
`schema`: \{
\};
`standaloneSchema`: \{
\};
\}, \{
`derive`: \{
\};
`resolve`: \{
\};
`response`: \{
\};
`schema`: \{
\};
`standaloneSchema`: \{
\};
\}\>

An Elysia plugin instance

## Description

This plugin uses Elysia's Context and extends it to export the following from the Context:

- `locale`: A locale of Request, this locale is detected by Elysia's [resolve](https://elysiajs.com/patterns/extends-context.html#resolve) using the locale detector specified in the plugin's `locale` option.
- `translate`: A TranslationFunction \| translate function, that translates based on the `messages` options specified in the plugin options and the detected locale.
- `translate`: A TranslationFunction \| translate function, that translates based on the `messages` options specified in the plugin options and the detected locale.

## Example

```js
import { Elysia } from 'elysia'
import { intlify } from '@intlify/elysia'

new Elysia()
  .use(
    intlify({
      messages: {
        en: {
          hello: 'Hello {name}!'
        },
        ja: {
          hello: 'こんにちは、{name}！'
        }
      },
      // your locale detection logic here
      locale: ctx => {
        // ...
      }
    })
  )
  .get('/', ctx => {
    // extended `locale` on Elysia Context
    console.log('current locale', ctx.locale)
    // extended `translate` on Elysia Context
    return ctx.translate('hello', { name: 'Elysia' })
  })
```
