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

- `LocaleMessage`\<`string`\>

## Indexable

```ts
[key: string]: LocaleMessageValue<string>
```
