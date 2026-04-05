[**@intlify/nitro**](../index.md)

---

[@intlify/nitro](../index.md) / DefineLocaleMessage

# Interface: DefineLocaleMessage

The type definition of Locale Message for `@intlify/nitro` package

## Example

```ts
// type.d.ts (`.d.ts` file at your app)
import { DefineLocaleMessage } from '@intlify/nitro'

declare module '@intlify/nitro' {
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

| Property                          | Type     | Description                            |
| --------------------------------- | -------- | -------------------------------------- |
| <a id="property-test"></a> `test` | `string` | Define your locale message schema here |
