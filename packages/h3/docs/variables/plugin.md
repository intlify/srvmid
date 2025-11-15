[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / plugin

# Variable: plugin()

```ts
const plugin: (options) => H3Plugin;
```

Internationalization plugin for H3

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`I18nPluginOptions`](../type-aliases/I18nPluginOptions.md) |

## Returns

`H3Plugin`

## Example

```ts
import { H3 } from 'h3'
import { plugin as i18n } from '@intlify/h3'

const app = new H3({
  plugins: [
    i18n({
      messages: {
        en: {
          hello: 'Hello {name}!',
        },
        ja: {
          hello: 'こんにちは、{name}！',
        },
      },
      // your locale detection logic here
      locale: (event) => {
        // ...
      },
    })
  ]
})
