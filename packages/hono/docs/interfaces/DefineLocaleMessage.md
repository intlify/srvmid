[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / DefineLocaleMessage

# Interface: DefineLocaleMessage

The type definition of Locale Message for `@intlify/hono` package

## Description

The typealias is used to strictly define the type of the Locale message.

## Example

```ts
// type.d.ts (`.d.ts` file at your app)
import { DefineLocaleMessage } from '@intlify/hono'

declare module '@intlify/hono' {
  export interface DefineLocaleMessage {
    title: string
    menu: {
      login: string
    }
  }
}
```

## Extends

- `LocaleMessage`\<`string`\>.`ResourceSchema`

## Indexable

```ts
[key: string]: LocaleMessageValue<string>
```

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| <a id="hello"></a> `hello` | `string` | `'hello, {name}'` |
| <a id="nest"></a> `nest` | `object` | `undefined` |
| `nest.foo` | `object` | `undefined` |
| `nest.foo.bar` | `string` | `'bar'` |
