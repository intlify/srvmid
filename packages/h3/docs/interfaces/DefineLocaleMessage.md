[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / DefineLocaleMessage

# Interface: DefineLocaleMessage

The type definition of Locale Message for `@intlify/h3` package

## Example

```ts
// type.d.ts (`.d.ts` file at your app)
import { DefineLocaleMessage } from '@intlify/h3'

declare module '@intlify/h3' {
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

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-test"></a> `test` | `string` | Define your locale message schema here |
