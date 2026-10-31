[**@intlify/elysia**](../index.md)

***

[@intlify/elysia](../index.md) / DefineLocaleMessage

# Interface: DefineLocaleMessage

The type definition of Locale Message for `@intlify/elysia` package

## Description

The typealias is used to strictly define the type of the Locale message.

## Example

```ts
// type.d.ts (`.d.ts` file at your app)
import { DefineLocaleMessage } from '@intlify/elysia'

declare module '@intlify/elysia' {
  export interface DefineLocaleMessage {
    title: string
    menu: {
      login: string
    }
  }
}
```

## Extends

- `LocaleMessage`\<`string`\>

## Indexable

```ts
[key: string]: LocaleMessageValue<string>
```
